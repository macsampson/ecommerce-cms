import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { CreateParcelRequest } from 'shippo'

import { stripe } from '@/lib/stripe'
import shippoClient from '@/lib/shippo'
import { Rate as ShippoRate } from 'shippo'
import prismadb from '@/lib/prismadb'
import { all } from 'axios'
import { headers } from 'next/headers'
import { Decimal } from '@prisma/client/runtime/library'

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

// const allowedOrigins = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(',')
//   : ([] as string[])

// // console.log('allowedOrigins: ', allowedOrigins)

// const corsHeaders = (origin: string) => ({
//   'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
//   'Access-Control-Allow-Methods': 'POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// })
// const allowedCountries: string[] = ["US", "CA"]

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('Origin') || ''

  // if (allowedOrigins.includes(origin)) {
  //   // console.log('origin: ', origin)
  //   console.log(corsHeaders(origin))
  // }

  return new NextResponse()
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
  name: string
}

//  cartItems:  {
//   'prod_id': {
//     name: 'Mooncake',
//     quantity: 3,
//     price: 51,
//     variations: {
//       'var_id': [Object],
//       'var_id': [Object]
//     }
//   }
//  }

type orderItemType = {
  id: string
  orderId: string
  productId: string
  createdAt: Date
  updatedAt: Date
  quantity: number
  productVariationId: string | null
  price: Decimal
  name: string
  bundleItems: any[]
}

type cartItemsObjectType = {
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
  // destructuring the request body as type cartItemsObjectType
  const {
    cartItems,
    selectedRate,
    shippingAddress,
    currency
  }: {
    cartItems: cartItemsObjectType
    selectedRate: ShippoRate
    shippingAddress: AddressType
    currency: string
  } = await req.json()

  if (!cartItems) {
    return new NextResponse('Product IDs are required', { status: 400 })
  }

  // console.log('cartItems: ', cartItems)
  // create stripe shipping options from shippo selected rate

  // let shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = []

  // shippingOptions = [
  //   {
  //     shipping_rate_data: {
  //       type: "fixed_amount",
  //       fixed_amount: {
  //         amount: Math.round(parseFloat(selectedRate.amount_local) * 100),
  //         currency: selectedRate.currency_local,
  //       },

  //       display_name:
  //         selectedRate.provider + " " + selectedRate.servicelevel.name,

  //       metadata: {
  //         id: selectedRate.object_id,
  //         provider: selectedRate.provider,
  //         servicelevel: selectedRate.servicelevel.name,
  //         estimated_days: selectedRate.estimated_days,
  //       },
  //     },
  //   },
  // ]

  // Create a single string from the shipping address object
  const shippingAddressObject = [
    shippingAddress.firstName + ' ' + shippingAddress.lastName,
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zip,
    shippingAddress.country
  ]

  const shippingAddressComponents = shippingAddressObject
    .filter((c) => c !== null)
    .join(', ')

  // create array from cartItems that contains the first element of each element in item
  const productIds: string[] = Object.keys(cartItems)

  // Start transaction
  try {
    const order = await prismadb.$transaction(async (prisma) => {
      const dbProducts = await prismadb.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        include: {
          bundles: true,
          variations: true
        }
      })

      // Check if all products exist and reserve the stock

      for (const dbProduct of dbProducts) {
        const cartItem = cartItems[dbProduct.id]

        if (dbProduct.quantity < cartItem.quantity) {
          console.log(`Not enough stock for product: ${dbProduct.name}`)
          throw new Error(`Not enough stock for product: ${dbProduct.name}`)
        }

        // Decrement inventory
        if (Object.keys(cartItem.variations).length > 0) {
          await Promise.all(
            Object.entries(cartItem.variations).map(
              async ([_, cartVariation]) => {
                const dbVariation = dbProduct.variations.find(
                  (v) => v.id === cartVariation.id
                )

                if (!dbVariation) {
                  throw new Error(
                    `Product ${dbProduct.name} does not have variation ${cartVariation.id}`
                  )
                }

                if (dbVariation.quantity < cartVariation.quantity) {
                  throw new Error(
                    `Insufficient stock for ${cartVariation.name} variation of ${dbProduct.name}`
                  )
                }

                await prisma.productVariation.update({
                  where: {
                    id: cartVariation.id
                  },
                  data: {
                    quantity: {
                      decrement: cartVariation.quantity
                    }
                  }
                })
              }
            )
          )
        }

        await prisma.product.update({
          where: {
            id: dbProduct.id
          },
          data: {
            quantity: {
              decrement: 1
            }
          }
        })
      }

      // Create the order in the database
      return prisma.order.create({
        data: {
          storeId: params.storeId,
          isPaid: false, // set true as per your payment logic
          totalPrice: Object.entries(cartItems).reduce((total, [_, item]) => {
            return total + item.price
          }, 0),
          shippingAddress: shippingAddressComponents,
          orderItems: {
            create: Object.entries(cartItems).flatMap(([productId, item]) => {
              // If the item is a bundle, create an orderItem for each variation
              if (Object.keys(item.variations).length > 0) {
                return Object.entries(item.variations).map(
                  ([variationId, variation]) => ({
                    product: { connect: { id: productId } },
                    price: variation.price,
                    quantity: variation.quantity, // Quantity per variation
                    productVariation: { connect: { id: variationId } }
                  })
                )
              } else {
                // If the item is not a bundle, create a single orderItem
                // console.log("non bundle item: ", item)
                return [
                  {
                    product: { connect: { id: productId } },
                    price: item.price,
                    quantity: item.quantity
                  }
                ]
              }
            })
          }
        },
        include: {
          orderItems: {
            include: {
              bundleItems: true
            }
          }
        }
      })
    })

    if (!order) {
      return new NextResponse(
        'Failed to process order due to inventory issues',
        {
          status: 400
        }
      )
    }

    //  Create line cartItems for the checkout session
    // const line_cartItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    // group order items by product id
    const groupedOrderItems = order.orderItems.reduce((acc, orderItem) => {
      if (acc[orderItem.productId]) {
        acc[orderItem.productId].push(orderItem)
      } else {
        acc[orderItem.productId] = [orderItem]
      }
      return acc
    }, {} as { [key: string]: orderItemType[] })

    // console.log('order items: ', groupedOrderItems)

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    try {
      line_items = Object.entries(groupedOrderItems).map(
        ([id, orderItems]) => ({
          quantity: orderItems.reduce((acc, item) => acc + item.quantity, 0),
          price_data: {
            currency: currency,
            product_data: {
              name: cartItems[id].name,
              // Format the list of variations for purchase in the description as a single string, separated by semicolons for readability
              description:
                Object.keys(cartItems[id].variations).length > 0
                  ? Object.entries(cartItems[id].variations)
                      .reduce((acc, [_, variation]) => {
                        // Add a semicolon and space separator between variations
                        return (
                          acc + variation.quantity + ' ' + variation.name + '; '
                        )
                      }, '')
                      .slice(0, -2) // Remove the last semicolon and space for cleanliness
                  : 'Standard'
            },
            unit_amount: (cartItems[id].price / cartItems[id].quantity) * 100
          }
        })
      )
    } catch (error) {
      console.log('Error creating line items: ', error)
    }

    // Create the checkout session
    if (line_items.length > 0) {
      try {
        const session = await stripe.checkout.sessions.create({
          line_items,
          mode: 'payment',
          billing_address_collection: 'required',
          currency,
          success_url: `${process.env.FRONTEND_STORE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_STORE_URL}/shipping/`,
          metadata: {
            orderId: order.id,
            shippingAddress: JSON.stringify(shippingAddress)
          },
          payment_intent_data: {
            metadata: {
              orderId: order.id,
              shippingRateId: selectedRate.object_id
            }
          },
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: Math.round(
                    parseFloat(selectedRate.amount_local) * 100
                  ),
                  currency: selectedRate.currency_local
                },

                display_name:
                  selectedRate.provider + ' ' + selectedRate.servicelevel.name,

                metadata: {
                  id: selectedRate.object_id,
                  provider: selectedRate.provider,
                  servicelevel: selectedRate.servicelevel.name,
                  estimated_days: selectedRate.estimated_days
                }
              }
            }
          ]
        })

        // Return the session URL to the frontend
        return NextResponse.json({
          url: session.url
        })
      } catch (error) {
        console.log('Error creating stipe checkout session: ', error)
      }
    }
  } catch (error: any) {
    // create a new NextResponse with the error message, cors headers, and status 500
    return new NextResponse(error.message, {
      status: 500
    })
  }
}
