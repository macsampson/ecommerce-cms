import Stripe from "stripe"
import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// These are the types for the request body that you will receive from the frontend

type ProductVariationType = {
  id: string
  quantity: number
  price: number
  name: string
}

type ItemType = {
  quantity: number // required if variations is empty
  price: number // required if variations is empty
  variations: ProductVariationType[]
}

type ItemsObjectType = {
  [key: string]: ItemType
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // destructuring the request body as type ItemsObjectType
  const { items }: { items: ItemsObjectType } = await req.json()

  console.log(items)

  if (!items) {
    return new NextResponse("Product IDs are required", { status: 400 })
  }

  // create array from items that contains the first element of each element in item
  const productIds: string[] = Object.keys(items)

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      bundles: true,
      variations: true,
    },
  })

  // console.log(products)

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  products.forEach((product) => {
    line_items.push({
      quantity: items[product.id].quantity,
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          metadata: {
            variations: JSON.stringify(items[product.id].variations),
          },
        },
        unit_amount:
          (items[product.id].price / items[product.id].quantity) * 100,
      },
    })
  })

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false, // set true as per your payment logic
      totalPrice: Object.entries(items).reduce((total, [productId, item]) => {
        total += item.price
        return total
      }, 0),

      // update with actual data if available
      orderItems: {
        create: Object.entries(items).map(([productId, item]) => {
          // Check if the item is a bundle (has variations)
          const isBundle = item.variations && item.variations.length > 0

          return {
            product: { connect: { id: productId } },
            price: item.price,
            quantity: item.quantity, // For bundles, quantity might be handled differently
            bundleItems: isBundle
              ? {
                  create: item.variations.map((variation) => ({
                    productVariation: { connect: { id: variation.id } },
                    quantity: variation.quantity,
                  })),
                }
              : undefined,
          }
        }),
      },
    },
    include: {
      orderItems: {
        include: {
          bundleItems: true,
        },
      },
    },
  })

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,
    },
  })

  return NextResponse.json(
    {
      url: session.url,
    },
    {
      headers: corsHeaders,
    }
  )
}
