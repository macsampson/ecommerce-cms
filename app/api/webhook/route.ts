import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

import shippoClient from "@/lib/shippo"

type ItemsObject = {
  [key: string]: number
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const currency = session?.currency

  const address = session?.customer_details?.address

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ]

  const addressString = addressComponents.filter((c) => c !== null).join(", ")

  // console.log("webhook received")
  // console.log(event)

  if (event.type === "checkout.session.completed") {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        emailAddress: session?.customer_details?.email || "",
      },
      include: {
        orderItems: true,
      },
    })

    // const order = await prismadb.order.create({
    //   data: {
    //     storeId: params.storeId,
    //     isPaid: false, // set true as per your payment logic
    //     totalPrice: Object.entries(items).reduce((total, [_, item]) => {
    //       return total + item.price
    //     }, 0),
    //     orderItems: {
    //       create: Object.entries(items).flatMap(([productId, item]) => {
    //         // If the item is a bundle, create an orderItem for each variation
    //         if (Object.keys(item.variations).length > 0) {
    //           return Object.entries(item.variations).map(
    //             ([variationId, variation]) => ({
    //               product: { connect: { id: productId } },
    //               price: variation.price,
    //               quantity: variation.quantity, // Quantity per variation
    //               productVariation: { connect: { id: variationId } },
    //             })
    //           )
    //         } else {
    //           // If the item is not a bundle, create a single orderItem
    //           return [
    //             {
    //               product: { connect: { id: productId } },
    //               price: item.price,
    //               quantity: item.quantity,
    //             },
    //           ]
    //         }
    //       }),
    //     },
    //   },
    //   include: {
    //     orderItems: {
    //       include: {
    //         bundleItems: true,
    //       },
    //     },
    //   },
    // })

    // const productIds = order.orderItems.map((orderItem) => orderItem.productId)
    const productsObject = order.orderItems.reduce(
      (acc: ItemsObject, orderItem) => {
        acc[orderItem.productId] = orderItem.quantity
        return acc
      },
      {}
    )

    // const productIds = Object.keys(productsObject)

    // await prismadb.product.updateMany({
    //   where: {
    //     id: {
    //       in: [...productIds],
    //     },
    //   },
    //   data: {
    //     isArchived: true,
    //   },
    // })

    for (const [productId, quantity] of Object.entries(productsObject)) {
      await prismadb.product.update({
        where: { id: productId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      })
    }

    // TODO: create shipment with shippo
    const shippingID = session.shipping_cost?.shipping_rate

    const shippingRate = await stripe.shippingRates.retrieve(
      shippingID as string
    )
    // console.log("retrieved from stripe: ", shippingRate)
    // console.log("shipping id: ", shippingRate.metadata.id)

    try {
      const transaction = shippoClient.transaction.create({
        rate: shippingRate.metadata.id,
        label_file_type: "PDF",
        async: false,
      })
      console.log(transaction)
    } catch (error) {
      console.log(error)
    }
  }

  return new NextResponse(null, { status: 200 })
}
