import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { formatter } from '@/lib/utils' // Assuming this is accessible

// This should match or be compatible with OrderColumn in the frontend
export type ApiOrderSummary = {
  id: string
  emailAddress: string
  address: string // Billing address
  shippingAddress: string
  phoneNumber: string
  customerName: string
  products: string // Formatted multi-line string of product names, variations, and quantities
  variations: string // Comma-separated string of variation names or 'Standard'
  totalPrice: string // Formatted currency string
  isPaid: boolean
  isAbandoned: boolean
  createdAt: string // Formatted date string 'yyyy-MM-dd hh:mm a'
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user"
      }
    })

    if (!store) {
      return new NextResponse('Unauthorized to access this store', {
        status: 403
      })
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId
        // isPaid: true, // This was commented out in the original page, so replicating that
      },
      include: {
        orderItems: {
          include: {
            product: true, // For product.name
            productVariation: true // For productVariation.name
            // Ensure 'quantity' is available on orderItem, it's used in formatting
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOrders: ApiOrderSummary[] = orders.map((order) => {
      const productGroups: { [key: string]: string[] } = {}
      order.orderItems.forEach((item) => {
        const productName = item.product?.name || 'Unknown Product' // Fallback for product name
        if (!productGroups[productName]) {
          productGroups[productName] = []
        }

        const variationName = item.productVariation
          ? item.productVariation.name
          : 'Standard'
        // Assuming item.quantity is available on OrderItem model
        const quantity = item.quantity || 1 // Fallback for quantity
        productGroups[productName].push(`- ${variationName} x${quantity}`)
      })

      const productString = Object.entries(productGroups)
        .map(([productName, variations]) => {
          return `${productName}\n ${variations.join('\n ')}`
        })
        .join('\n\n')

      const variationsString = order.orderItems
        .map((item) => {
          return item.productVariation ? item.productVariation.name : 'Standard'
        })
        .join(', ')

      return {
        id: order.id,
        emailAddress: order.emailAddress || '', // Ensure no null values for strings
        address: order.billingAddress || '',
        shippingAddress: order.shippingAddress || '',
        phoneNumber: order.phoneNumber || '',
        customerName: order.customerName || '',
        products: productString,
        variations: variationsString,
        totalPrice: order.totalPriceInCents
          ? formatter.format(order.totalPriceInCents / 100)
          : 'N/A',
        isPaid: order.isPaid,
        isAbandoned: order.isAbandoned, // Assuming this field exists on the Order model
        createdAt: order.createdAt
          ? format(order.createdAt, 'yyyy-MM-dd hh:mm a')
          : 'N/A'
      }
    })

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('[ORDERS_SUMMARY_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
