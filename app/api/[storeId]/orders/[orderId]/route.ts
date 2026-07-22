import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'
import { parseShippingAddress } from '@/lib/parse-shipping-address'

const DEFAULT_PARCEL = {
  lengthCm: 23,
  widthCm: 16,
  heightCm: 5
}

export async function GET(
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

    const weightGrams = order.orderItems.reduce(
      (acc, item) => acc + Number(item.weight) * item.quantity,
      0
    )

    return NextResponse.json({
      order: {
        id: order.id,
        customerName: order.customerName,
        emailAddress: order.emailAddress,
        phoneNumber: order.phoneNumber,
        isPaid: order.isPaid,
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          name: item.product?.name || 'Unknown Product',
          variation: item.productVariation?.name || null,
          quantity: item.quantity,
          weight: Number(item.weight)
        }))
      },
      parsedAddress: parseShippingAddress(order),
      defaultParcel: {
        weightGrams,
        ...DEFAULT_PARCEL
      },
      shipToAddress: order.shipToAddress,
      shippingLabel: order.shippingLabel
    })
  } catch (error) {
    logger.error('[ORDER_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
