import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'
import { getShippoApiKey } from '@/lib/shipping-config'
import {
  createShippoShipment,
  flattenShippoError,
  ShippoAddress,
  ShippoRate
} from '@/lib/shippo'

type RequestAddress = {
  name: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
}

type RequestParcel = {
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

type CustomsDeclarationInfo = {
  items: {
    description: string
    mass_unit: string
    origin_country: string
    tariff_number: string
  }[]
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
      },
      include: {
        orderItems: {
          include: {
            product: true,
            productVariation: true
          }
        }
      }
    })

    if (!order) {
      return new NextResponse('Order not found', { status: 404 })
    }

    const {
      address,
      parcel
    }: { address: RequestAddress; parcel: RequestParcel } = await req.json()

    if (!address?.street1 || !address?.city || !address?.zip || !address?.country) {
      return NextResponse.json(
        { success: false, error: 'Recipient address is incomplete' },
        { status: 400 }
      )
    }

    if (!parcel?.weightGrams || parcel.weightGrams <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Parcel weight must be greater than 0g — carriers reject zero-weight packages. Check the item weights on the products in this order.'
        },
        { status: 400 }
      )
    }

    const shippingSettings = await prismadb.shippingSettings.findUnique({
      where: { storeId: params.storeId }
    })

    if (!shippingSettings) {
      return NextResponse.json(
        { success: false, error: 'Sender address not found' },
        { status: 404 }
      )
    }

    const apiKey = getShippoApiKey(shippingSettings)

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Shippo API key is not configured' },
        { status: 500 }
      )
    }

    const addressFrom: ShippoAddress = {
      name: shippingSettings.name,
      company: shippingSettings.company,
      street1: shippingSettings.street1,
      city: shippingSettings.city,
      state: shippingSettings.state,
      zip: shippingSettings.zip,
      country: shippingSettings.country,
      phone: shippingSettings.phone,
      email: shippingSettings.email,
      is_residential: false
    }

    const addressTo: ShippoAddress = {
      name: address.name,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
      email: address.email,
      is_residential: true
    }

    const weightGrams =
      parcel?.weightGrams ??
      order.orderItems.reduce(
        (acc, item) => acc + Number(item.weight) * item.quantity,
        0
      )

    const parcelData = {
      length: String(parcel?.lengthCm ?? 23),
      width: String(parcel?.widthCm ?? 16),
      height: String(parcel?.heightCm ?? 5),
      distance_unit: 'cm',
      weight: String(weightGrams),
      weight_unit: 'g',
      mass_unit: 'g'
    }

    const lineItems = order.orderItems.map((item) => ({
      title: item.product?.name || 'Item',
      sku: item.productId,
      quantity: item.quantity,
      total_price: (
        (item.priceInCents * item.quantity) /
        100
      ).toFixed(2),
      currency: 'USD',
      weight: String(Number(item.weight) * item.quantity),
      weight_unit: 'g',
      mass_unit: 'g',
      manufacture_country: shippingSettings.country
    }))

    const customsDeclarationInfo =
      shippingSettings.customsDeclaration as CustomsDeclarationInfo | null

    const customsDeclaration =
      customsDeclarationInfo && addressTo.country !== shippingSettings.country
        ? {
            ...customsDeclarationInfo,
            items: customsDeclarationInfo.items.map((item) => ({
              ...item,
              net_weight: String(weightGrams),
              quantity: order.orderItems.reduce(
                (acc, item) => acc + item.quantity,
                0
              ),
              value_amount: (order.totalPriceInCents / 100).toFixed(2),
              value_currency: 'USD'
            }))
          }
        : undefined

    const shippoData = await createShippoShipment({
      apiKey,
      addressFrom,
      addressTo,
      parcel: parcelData,
      lineItems,
      customsDeclaration
    })

    if (!shippoData.rates.length) {
      const error =
        shippoData.messages?.map((m) => m.text).join('; ') ||
        (!shippoData.httpOk && flattenShippoError(shippoData.raw)) ||
        'Shippo returned no rates for this address'

      logger.error('[ORDER_SHIPPING_RATES] Shippo returned no rates', {
        orderId: params.orderId,
        httpOk: shippoData.httpOk,
        raw: shippoData.raw
      })
      return NextResponse.json(
        { success: false, error, messages: shippoData.messages },
        { status: 422 }
      )
    }

    await prismadb.order.update({
      where: { id: params.orderId },
      data: { shipToAddress: address as any }
    })

    const rates = shippoData.rates.map((rate: ShippoRate) => ({
      id: rate.object_id,
      provider: 'Shippo',
      title:
        rate.servicelevel.display_name ||
        `${rate.provider} ${rate.servicelevel.name}`,
      description:
        rate.duration_terms ||
        (rate.estimated_days &&
          `${rate.estimated_days} day${
            rate.estimated_days !== 1 ? 's' : ''
          } delivery`) ||
        'Exact delivery estimate not available',
      amount: rate.amount,
      currency: rate.currency,
      estimated_days: rate.estimated_days
    }))

    return NextResponse.json({ success: true, rates })
  } catch (error) {
    logger.error('[ORDER_SHIPPING_RATES]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping rates' },
      { status: 500 }
    )
  }
}
