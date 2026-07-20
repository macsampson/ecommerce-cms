import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'

interface CartItem {
  name: string
  category: string
  quantity: number
  priceInCents: number
  variations?: Record<
    string,
    {
      name: string
      priceInCents: number
      cartQuantity: number
      inventoryAmount: number
    }
  >
  weight?: number
}

export interface Address {
  email: string
  firstName: string
  lastName: string
  street: string
  apartment?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

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

  if (event.type === 'checkout.session.completed') {
    logger.info('Processing checkout.session.completed webhook', session.id)

    if (!session?.metadata?.storeId) {
      logger.error('No store ID in session metadata')
      return new NextResponse('Store ID is required', { status: 400 })
    }

    // Stripe may redeliver the same event (e.g. on a timeout or retry), so
    // record it before doing any work and bail out if we've already processed it.
    // Otherwise a redelivered event would create a duplicate order and double-decrement inventory.
    try {
      await prismadb.processedWebhookEvent.create({
        data: { stripeEventId: event.id }
      })
    } catch (error: any) {
      if (error?.code === 'P2002') {
        logger.info('Ignoring already-processed webhook event', event.id)
        return new NextResponse(null, { status: 200 })
      }
      throw error
    }

    try {
      const storeId = session.metadata.storeId
      const shippingAddress: Address = JSON.parse(
        session.metadata.shippingAddress || '{}'
      )
      const shippingType = JSON.parse(session.metadata.shippingType || '{}')
      const currency = session.metadata.currency || 'usd'
      const cartItems: Record<string, CartItem> = JSON.parse(
        session.metadata.cartItems || '{}'
      )

      logger.info('Processing order for store:', storeId)
      logger.info('Cart items:', Object.keys(cartItems).length)
      logger.info('Shipping method:', shippingType.title || 'None')
      logger.info('Currency:', currency.toUpperCase())

      // Calculate total price in cents from session
      const totalPriceInCents = Math.round(session.amount_total || 0)

      // Create order in database
      const order = await prismadb.order.create({
        data: {
          storeId,
          isPaid: true,
          phoneNumber: session?.customer_details?.phone || shippingAddress.phone || '',
          emailAddress: session?.customer_details?.email || shippingAddress.email || '',
          customerName: session?.customer_details?.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
          billingAddress: session.customer_details?.address ? 
            `${session.customer_details.address.line1 || ''} ${session.customer_details.address.line2 || ''}, ${session.customer_details.address.city || ''}, ${session.customer_details.address.state || ''} ${session.customer_details.address.postal_code || ''}, ${session.customer_details.address.country || ''}`.trim() 
            : '',
          shippingAddress: `${shippingAddress.street || ''} ${
            shippingAddress.apartment || ''
          }, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${
            shippingAddress.zip || ''
          }, ${shippingAddress.country || ''}`.trim(),
          totalPriceInCents
        }
      })

      // Create order items
      const orderItems = []
      for (const [productId, item] of Object.entries(cartItems)) {
        const product = await prismadb.product.findUnique({
          where: {
            id: productId,
            storeId
          }
        })

        if (product) {
          // Handle products with variations - create separate order items for each variation
          if (item.variations && Object.keys(item.variations).length > 0) {
            for (const [variationId, variationData] of Object.entries(
              item.variations
            )) {
              const variation = await prismadb.productVariation.findUnique({
                where: {
                  id: variationId
                }
              })

              if (variation) {
                // Create order item for this specific variation
                const orderItem = await prismadb.orderItem.create({
                  data: {
                    orderId: order.id,
                    productId: productId,
                    productVariationId: variationId,
                    quantity: variationData.cartQuantity,
                    priceInCents: variationData.priceInCents,
                    name: `${item.name} - ${variation.name}`,
                    weight: item.weight || 0
                  }
                })
                orderItems.push(orderItem)

                // Reduce variation inventory
                if (variation.quantity !== null) {
                  await prismadb.productVariation.update({
                    where: {
                      id: variationId
                    },
                    data: {
                      quantity: Math.max(
                        0,
                        variation.quantity - variationData.cartQuantity
                      )
                    }
                  })
                }
              }
            }
          } else {
            // Handle products without variations - create single order item
            const orderItem = await prismadb.orderItem.create({
              data: {
                orderId: order.id,
                productId: productId,
                quantity: item.quantity,
                priceInCents: item.priceInCents,
                name: item.name,
                weight: item.weight || 0
              }
            })
            orderItems.push(orderItem)

            // Update main product inventory
            if (product.quantity !== null) {
              await prismadb.product.update({
                where: {
                  id: productId
                },
                data: {
                  quantity: Math.max(0, product.quantity - item.quantity)
                }
              })
            }
          }
        }
      }

      // Customer info is stored in the order itself, no separate customer table

      logger.info('Order created successfully:', order.id)
    } catch (error) {
      logger.error('Error processing webhook:', error)
      return new NextResponse('Error processing order', { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
