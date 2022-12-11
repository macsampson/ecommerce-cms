import prismadb from "@/lib/prismadb"
import { OrderClient } from "./components/client"
import { OrderColumn } from "./components/columns"
import { format } from "date-fns"
import { formatter } from "@/lib/utils"
import { revalidatePath } from "next/cache"

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          bundleItems: {
            include: {
              productVariation: true,
            },
          },
          productVariation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const formattedOrders: OrderColumn[] = orders.map((order) => ({
    id: order.id,
    phone: order.phone,
    address: order.address,
    // for each product, if it has bundle items, then show the product name and the bundle items
    // otherwise, show the product name and the product variation name
    // join all of these with a comma
    products: order.orderItems
      .map((item) => {
        if (item.bundleItems.length > 0) {
          return `${item.product.name} (${item.bundleItems
            .map(
              (bundleItem) =>
                `${bundleItem.quantity}x ${bundleItem.productVariation.name}`
            )
            .join(", ")})`
        } else {
          return `${item.product.name} (${
            item.productVariation ? item.productVariation.name : "Standard"
          })`
        }
      })
      .join(" | "),
    variations: order.orderItems
      .map((item) => {
        if (item.bundleItems.length > 0) {
          return `${item.product.name} (${item.bundleItems
            .map((bundleItem) => bundleItem.productVariation.name)
            .join(", ")})`
        } else {
          return `${item.product.name} (${
            item.productVariation ? item.productVariation.name : "Standard"
          })`
        }
      })
      .join(", "),
    totalPrice: formatter.format(order.totalPrice.toNumber()),
    isPaid: order.isPaid,
    createdAt: format(order.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  )
}

export default OrdersPage
