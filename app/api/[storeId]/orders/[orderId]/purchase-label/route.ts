import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'
import { getShippoApiKey } from '@/lib/shipping-config'
import { purchaseShippoLabel } from '@/lib/shippo'

type SelectedRate = {
  provider?: string
  title?: string
  amount?: string
  currency?: string
}

export async function POST(
  req: Request,
  props: { params: Promise<{ storeId: string; orderId: string }> }
) {
  const params = await props.params

  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: 'single-user'
      }
    })

    if (!store) {
      return new NextResponse('Unauthorized to access this store', {
        status: 403
      })
    }

    const order = await prismadb.order.findFirst({
      where: {
        id: params.orderId,
        storeId: params.storeId
      }
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    if (order.shippingLabel) {
      return NextResponse.json(
        { success: false, error: 'Label already purchased for this order' },
        { status: 409 }
      )
    }

    const {
      rateObjectId,
      rate,
      parcel
    }: {
      rateObjectId: string
      rate?: SelectedRate
      parcel?: {
        weightGrams: number
        lengthCm: number
        widthCm: number
        heightCm: number
      }
    } = await req.json()

    if (!rateObjectId) {
      return NextResponse.json(
        { success: false, error: 'rateObjectId is required' },
        { status: 400 }
      )
    }

    const shippingSettings = await prismadb.shippingSettings.findUnique({
      where: { storeId: params.storeId }
    })

    const apiKey = getShippoApiKey(shippingSettings)

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Shippo API key is not configured' },
        { status: 500 }
      )
    }

    const transaction = await purchaseShippoLabel({
      apiKey,
      rate: rateObjectId
    })

    if (transaction.status !== 'SUCCESS') {
      logger.error('[ORDER_PURCHASE_LABEL] Shippo transaction failed', {
        orderId: params.orderId,
        messages: transaction.messages
      })
      return NextResponse.json(
        {
          success: false,
          error:
            transaction.messages?.map((m) => m.text).join('; ') ||
            'Shippo could not purchase this label',
          messages: transaction.messages
        },
        { status: 422 }
      )
    }

    const shippingLabel = {
      provider: 'shippo',
      carrier: rate?.provider || null,
      serviceLevel: rate?.title || null,
      rateObjectId,
      transactionId: transaction.object_id,
      labelUrl: transaction.label_url,
      trackingNumber: transaction.tracking_number,
      trackingUrlProvider: transaction.tracking_url_provider,
      costAmount: rate?.amount || null,
      costCurrency: rate?.currency || null,
      purchasedAt: new Date().toISOString(),
      parcel: parcel || null
    }

    await prismadb.order.update({
      where: { id: params.orderId },
      data: { shippingLabel: shippingLabel as any }
    })

    return NextResponse.json({ success: true, shippingLabel })
  } catch (error) {
    logger.error('[ORDER_PURCHASE_LABEL]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to purchase shipping label' },
      { status: 500 }
    )
  }
}
