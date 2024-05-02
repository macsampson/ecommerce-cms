import Stripe from "stripe"
import { NextResponse } from "next/server"
import { CreateParcelRequest } from "shippo"

import { stripe } from "@/lib/stripe"
import shippoClient from "@/lib/shippo"
import { Rate as ShippoRate } from "shippo"
import prismadb from "@/lib/prismadb"

// const addressFromCanada = {
//   name: "Pocket Caps",
//   company: "PocketCaps",
//   street1: "4730 Lougheed Hwy",
//   city: "Burnaby",
//   state: "BC",
//   zip: "v6e 0m9",
//   country: "CA", // iso2 country code
//   phone: "",
//   email: "pocketcaps@gmail.com",
// }

// const addressFromUSTesting = {
//   name: "Pocket Caps",
//   company: "PocketCaps",
//   street1: "102 Los Altos Ave",
//   city: "Los Altos",
//   state: "CA",
//   zip: "94022",
//   country: "US", // iso2 country code
//   phone: "",
//   email: "pocketcaps@gmail.com",
// }

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",") : [] as string[]


const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

// const allowedCountries: string[] = ["US", "CA"]

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("Origin") || ""

  return NextResponse.json({}, { headers: corsHeaders(origin) })
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

// type ShippingRateType = {
//   id: string
//   amount: string
//   amount_local: string
//   currency: string
//   currency_local: string
//   estimated_days: number
//   title: string
// }

type AddressType = {
  firstName: string
  lastName: string
  apartment: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  email: string
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // destructuring the request body as type ItemsObjectType
  const {
    items,
    selectedRate,
    shippingAddress,
    currency,
  }: {
    items: ItemsObjectType
    selectedRate: ShippoRate
    shippingAddress: AddressType
    currency: string
  } = await req.json()

  // console.log("selected rate: ", selectedRate)

  if (!items) {
    return new NextResponse("Product IDs are required", { status: 400 })
  }

  // Check if the shipping rate is valid
  // if (!selectedRate) {
  //   return new NextResponse("Shipping rate is required", { status: 400 })
  // }

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

  // // create shippo address and validate it
  // const addressFrom = await shippoClient.address.create(addressFromUS)
  // console.log(addressFrom)

  // const addressTo = await shippoClient.address.create({
  //   // Only state and zip might be sufficient for an estimate
  //   name: shippingAddress.firstName + " " + shippingAddress.lastName,
  //   street1: shippingAddress.street,
  //   city: shippingAddress.city,
  //   state: shippingAddress.state,
  //   zip: shippingAddress.zip,
  //   country: shippingAddress.country, // Make sure to include the country
  //   email: shippingAddress.email,
  // })
  // console.log(addressTo)

  // const shipmentObject = {
  //   // ... other required fields,

  //   address_from: addressFromCanada,
  //   address_to: {
  //     // Only state and zip might be sufficient for an estimate
  //     name: shippingAddress.firstName + " " + shippingAddress.lastName,
  //     street1: shippingAddress.street,
  //     city: shippingAddress.city,
  //     state: shippingAddress.state,
  //     zip: shippingAddress.zip,
  //     country: shippingAddress.country, // Make sure to include the country
  //     email: shippingAddress.email,
  //   },
  //   parcels: [
  //     {
  //       height: `${12.5}`, // Converts the number 12.5 to a string "12.5"
  //       distance_unit: "in",
  //       length: `${12.5}`, // Converts the number 12.5 to a string "12.5"
  //       width: `${6}`, // Converts the number 6 to a string "6"
  //       weight: `${12}`, // Converts the number 12 to a string "12"
  //       mass_unit: "lb",
  //     },
  //   ] as CreateParcelRequest[],
  //   // parcels: ["dca6c762810f40658ae52cf86b455efd"],
  //   // line_items: lineItems,
  // }

  // console.log("checkout ", shipmentObject)

  // console.log(shipmentObject)

  // try {
  //   const shipment = await shippoClient.shipment.create(shipmentObject)
  //   // console.log(shipment)
  //   // create stripe shipping options from shippo rates
  //   shippingOptions = shipment.rates.slice(0, 5).map((rate: ShippoRate) => {
  //     // console.log(parseFloat(rate.amount) * 100)

  //     return {
  //       shipping_rate_data: {
  //         // id: rate.object_id,
  //         type: "fixed_amount",
  //         fixed_amount: {
  //           amount: Math.round(parseFloat(rate.amount_local) * 100),
  //           currency: rate.currency_local,
  //         },

  //         display_name: rate.provider + " " + rate.servicelevel.name,
  //         metadata: {
  //           id: rate.object_id,
  //           provider: rate.provider,
  //           servicelevel: rate.servicelevel.name,
  //           estimated_days: rate.estimated_days,
  //         },
  //       },
  //     }
  //   })
  // } catch (error) {
  //   console.log(error)
  // }
  let shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = []

  // create stripe shipping options from shippo selected rate
  shippingOptions = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.round(parseFloat(selectedRate.amount_local) * 100),
          currency: selectedRate.currency_local,
        },

        display_name:
          selectedRate.provider + " " + selectedRate.servicelevel.name,

        metadata: {
          id: selectedRate.object_id,
          provider: selectedRate.provider,
          servicelevel: selectedRate.servicelevel.name,
          estimated_days: selectedRate.estimated_days,
        },
      },
    },
  ]

  const shippingAddressObject = [
    shippingAddress.firstName + " " + shippingAddress.lastName,
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zip,
    shippingAddress.country,
  ]

  const shippingAddressComponents = shippingAddressObject
    .filter((c) => c !== null)
    .join(", ")

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  // console.log("items: ", items)
  // console.log("products: ", products)
  products.forEach((product) => {
    line_items.push({
      quantity: items[product.id].quantity,
      price_data: {
        currency: currency,
        product_data: {
          name: product.name,
          // Format the list of variations for purchase in the description as a single string, separated by semicolons for readability
          description:
            Object.keys(items[product.id].variations).length > 0
              ? Object.entries(items[product.id].variations)
                  .reduce((acc, [_, variation]) => {
                    // Add a semicolon and space separator between variations
                    return (
                      acc + variation.quantity + " " + variation.name + "; "
                    )
                  }, "")
                  .slice(0, -2) // Remove the last semicolon and space for cleanliness
              : "Standard",
          // Remove the last semicolon and space for cleanliness
          metadata: {
            // variations: JSON.stringify(items[product.id].variations),
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
      totalPrice: Object.entries(items).reduce((total, [_, item]) => {
        return total + item.price
      }, 0),
      shippingAddress: shippingAddressComponents,

      orderItems: {
        create: Object.entries(items).flatMap(([productId, item]) => {
          // If the item is a bundle, create an orderItem for each variation
          if (Object.keys(item.variations).length > 0) {
            // console.log("bundle item: ", item)
            return Object.entries(item.variations).map(
              ([variationId, variation]) => ({
                product: { connect: { id: productId } },
                price: variation.price,
                quantity: variation.quantity, // Quantity per variation
                productVariation: { connect: { id: variationId } },
              })
            )
          } else {
            // If the item is not a bundle, create a single orderItem
            // console.log("non bundle item: ", item)
            return [
              {
                product: { connect: { id: productId } },
                price: item.price,
                quantity: item.quantity,
              },
            ]
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
    currency,
    // phone_number_collection: {
    //   enabled: true,
    // },
    success_url: `${process.env.FRONTEND_STORE_URL}/shipping?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/shipping?canceled=1`,
    metadata: {
      orderId: order.id,
    },
    shipping_options: shippingOptions,
  })

  return NextResponse.json(
    {
      url: session.url,
    },
    {
      headers: corsHeaders(req.headers.get("Origin") || ""),
    }
  )
}
