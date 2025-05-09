import Stripe from 'stripe'
import { NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'
import { Decimal } from '@prisma/client/runtime/library'

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('Origin') || ''

  return new NextResponse()
}

// These are the types for the request body that you will receive from the frontend

type ProductVariationType = {
  cartQuantity: number
  price: number
  name: string
}

type ItemType = {
  cartQuantity: number
  price: number
  variations: Record<string, ProductVariationType>
  name: string
  category: string
  weight: number
}

// Example of the cartItems object that you will receive from the frontend
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
  weight: Decimal
}

type cartItemsObjectType = {
  [key: string]: ItemType
}

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

// type ShippoRate = {
//   id: string
//   amount: string
//   amount_local: string
//   currency: string
//   currency_local: string
//   estimated_days: number
//   title: string
// }

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // destructuring the request body as type cartItemsObjectType
  const {
    cartItems,
    totalPrice,
    shippingType,
    shippingAddress,
    currency
  }: {
    cartItems: cartItemsObjectType
    totalPrice: number
    shippingType: {
      id: string
      rate: number
      title: string
      originalCurrency: string
    }
    shippingAddress: AddressType
    currency: string
  } = await req.json()

  // console.log('totalPrice: ', totalPrice)
  // console.log('shippingType: ', shippingType)
  // console.log('shippingAddress: ', shippingAddress)
  // console.log('currency: ', currency)

  if (!cartItems) {
    return new NextResponse('Product IDs are required', { status: 400 })
  }

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
  // console.log('productIds: ', productIds)

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

        if (dbProduct.quantity < cartItem.cartQuantity) {
          console.log(`Not enough stock for product: ${dbProduct.name}`)
          throw new Error(`Not enough stock for product: ${dbProduct.name}`)
        }

        // Decrement inventory
        if (Object.keys(cartItem.variations).length > 0) {
          await Promise.all(
            Object.entries(cartItem.variations).map(
              async ([variationId, variation]) => {
                const dbVariation = dbProduct.variations.find(
                  (v) => v.id === variationId
                )
                // console.log('variationId: ', variationId)
                if (!dbVariation) {
                  throw new Error(
                    `Product ${dbProduct.name} does not have variation ${variation.name}`
                  )
                }

                if (dbVariation.quantity < variation.cartQuantity) {
                  throw new Error(
                    `Insufficient stock for ${variation.name} variation of ${dbProduct.name}`
                  )
                }

                await prisma.productVariation.update({
                  where: {
                    id: variationId
                  },
                  data: {
                    quantity: {
                      decrement: variation.cartQuantity
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

      // console.log('Cart Items: ', cartItems)
      // Create the order in the database
      return prisma.order.create({
        data: {
          storeId: params.storeId,
          isPaid: false, // set to false until payment is successful (webhook)
          totalPrice: totalPrice,
          shippingAddress: shippingAddressComponents,
          orderItems: {
            create: Object.entries(cartItems).flatMap(([productId, item]) => {
              // If the item is a bundle, create an orderItem for each variation
              if (Object.keys(item.variations).length) {
                return Object.entries(item.variations).map(
                  ([variationId, variation]) => ({
                    product: { connect: { id: productId } },
                    price: variation.price,
                    quantity: variation.cartQuantity, // Quantity per variation
                    productVariation: { connect: { id: variationId } },
                    weight: item.weight,
                    name: variation.name + ' - ' + item.name
                  })
                )
              } else {
                // If the item is not a bundle, create a single orderItem
                // console.log("non bundle item: ", item)
                return [
                  {
                    product: { connect: { id: productId } },
                    price: item.price,
                    quantity: item.cartQuantity,
                    weight: item.weight,
                    name: item.name
                  }
                ]
              }
            })
          }
        },
        include: {
          orderItems: true
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

    //  Create lineitems for the checkout session. group order items by product id, so variants will be one item
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
              name: cartItems[id].name + ' ' + cartItems[id].category,
              // Format the list of variations for purchase in the description as a single string, separated by semicolons for readability
              description: Object.keys(cartItems[id].variations).length
                ? Object.entries(cartItems[id].variations)
                    .reduce((acc, [_, variation]) => {
                      // Add a semicolon and space separator between variations
                      return (
                        acc +
                        variation.cartQuantity +
                        ' ' +
                        variation.name +
                        '; '
                      )
                    }, '')
                    .slice(0, -2) // Remove the last semicolon and space for cleanliness
                : 'Standard'
            },
            unit_amount: Math.round(cartItems[id].price * 100)
          }
        })
      )
    } catch (error) {
      console.log('Error creating line items: ', error)
    }

    // console.log('orderItems: ', order.orderItems)

    // Check if email is provided
    if (!shippingAddress.email) {
      console.log('Missing email in shipping address:', shippingAddress)
      return new NextResponse('Valid email address is required', {
        status: 400
      })
    }

    // Add email validation (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingAddress.email)) {
      console.log('Invalid email format:', shippingAddress.email)
      return new NextResponse('Invalid email address format', { status: 400 })
    }

    const shippingRate = await stripe.shippingRates.create({
      display_name: shippingType.title,
      type: 'fixed_amount',
      fixed_amount: {
        amount: Math.round(shippingType.rate * 100),
        currency: currency
      }
    })

    // Create the checkout session
    if (line_items.length > 0) {
      try {
        const session = await stripe.checkout.sessions.create({
          line_items,
          mode: 'payment',
          billing_address_collection: 'required',
          currency,
          customer_email: shippingAddress.email,
          success_url: `${process.env.FRONTEND_STORE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_STORE_URL}/shipping/`,
          metadata: {
            orderId: order.id,
            shippingAddress: JSON.stringify(shippingAddress),
            shippingRateId: shippingType.id,
            shippingRateAmount: shippingType.rate,
            shippingRateTitle: shippingType.title,
            totalWeight: order.orderItems.reduce(
              (acc, item) =>
                acc + parseFloat(item.weight.toString()) * item.quantity,
              0
            )
          },
          payment_intent_data: {
            metadata: {
              orderId: order.id
              // shippingRateId: shippingType.id
            }
          }
          // shipping_options: [
          //   {
          //     shipping_rate: shippingRate.id
          //   }
          // ]
        })

        // Example of a shipping rate object
        //                 {
        //   "id": "shr_1MrRx2LkdIwHu7ixikgEA6Wd",
        //   "object": "shipping_rate",
        //   "active": true,
        //   "created": 1680207604,
        //   "delivery_estimate": null,
        //   "display_name": "Ground shipping",
        //   "fixed_amount": {
        //     "amount": 500,
        //     "currency": "usd"
        //   },
        //   "livemode": false,
        //   "metadata": {},
        //   "tax_behavior": "unspecified",
        //   "tax_code": null,
        //   "type": "fixed_amount"
        // }

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
