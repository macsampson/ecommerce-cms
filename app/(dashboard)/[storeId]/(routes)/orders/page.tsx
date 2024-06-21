import prismadb from '@/lib/prismadb'
import { OrderClient } from './components/client'
import { OrderColumn } from './components/columns'
import { format } from 'date-fns'
import { formatter } from '@/lib/utils'
// import { revalidatePath } from 'next/cache'

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId
      // isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          productVariation: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedOrders: OrderColumn[] = orders.map((order) => {
    const productGroups: { [key: string]: string[] } = {}
    order.orderItems.forEach((item) => {
      const productName = item.product.name
      if (!productGroups[productName]) {
        productGroups[productName] = []
      }

      const variationName = item.productVariation
        ? item.productVariation.name
        : 'Standard'
      productGroups[productName].push(`- ${variationName} x${item.quantity}`)
    })

    const productString = Object.entries(productGroups)
      .map(([productName, variations]) => {
        return `${productName}\n ${variations.join('\n ')}`
      })
      .join('\n\n')

    return {
      id: order.id,
      emailAddress: order.emailAddress,
      address: order.billingAddress,
      shippingAddress: order.shippingAddress,
      // for each product, if it has bundle items, then show the product name and the bundle items
      // otherwise, show the product name and the product variation name
      // join all of these with a comma
      products: productString,
      variations: order.orderItems
        .map((item) => {
          return item.productVariation ? item.productVariation.name : 'Standard'
        })
        .join(', '),
      totalPrice: formatter.format(order.totalPrice.toNumber()),
      isPaid: order.isPaid,
      isAbandoned: order.isAbandoned,
      createdAt: format(order.createdAt, 'yyyy-MM-dd hh:mm a')
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6 whitespace-pre-wrap">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  )
}

export default OrdersPage
