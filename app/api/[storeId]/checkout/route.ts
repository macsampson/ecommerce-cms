import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import type { Store } from '@prisma/client'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

interface CartItem {
  name: string
  priceInCents?: number
  price?: number
  quantity: number
  category?: string
  variations?: Record<string, any>
  weight?: number
}

interface CartItems {
  [productId: string]: CartItem
}

interface ShippingType {
  id: string
  title: string
  rate: number
}

interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// CORS headers (Access-Control-Allow-*) are added by middleware.ts, which echoes
// back the request's Origin only if it's in ALLOWED_ORIGINS — do not set a
// wildcard here, it would bypass that origin restriction.
export async function OPTIONS() {
  return NextResponse.json({})
}

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  try {
    const ip = getClientIp(req)
    const { allowed } = rateLimit(`checkout:${ip}`, 20, 60_000)

    if (!allowed) {
      return new NextResponse('Too many requests. Please try again shortly.', {
        status: 429
      })
    }

    const { storeId } = params
    const body = await req.json()
    const {
      cartItems,
      totalPrice,
      shippingType,
      shippingAddress,
      currency
    }: {
      cartItems: CartItems
      totalPrice: number
      shippingType?: ShippingType
      shippingAddress: ShippingAddress
      currency: string
    } = body

    if (!cartItems || Object.keys(cartItems).length === 0) {
      return new NextResponse('Cart items are required', { status: 400 })
    }

    if (!totalPrice) {
      return new NextResponse('Total price is required', { status: 400 })
    }

    if (!shippingAddress) {
      return new NextResponse('Shipping address is required', { status: 400 })
    }

    // Verify store exists
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
        userId: 'single-user'
      }
    })

    if (!store) {
      return new NextResponse('Store not found', { status: 404 })
    }

    // Create line items for Stripe checkout
    const line_items: Array<{
      price_data: {
        currency: string
        product_data: {
          name: string
          metadata: Record<string, string>
        }
        unit_amount: number
      }
      quantity: number
    }> = []

    for (const [productId, item] of Object.entries(cartItems)) {
      // Debug logging
      logger.info('Processing item:', { productId, item })

      // Ensure price is a valid number (frontend sends priceInCents)
      const priceInCents = item.priceInCents || item.price || 0 // Handle both field names
      const itemPriceInCents =
        typeof priceInCents === 'number'
          ? priceInCents
          : parseFloat(priceInCents)
      const itemQuantity =
        typeof item.quantity === 'number'
          ? item.quantity
          : parseInt(item.quantity)

      if (isNaN(itemPriceInCents) || isNaN(itemQuantity)) {
        logger.error('Invalid price or quantity:', {
          productId,
          priceInCents,
          quantity: item.quantity
        })
        continue // Skip invalid items
      }

      line_items.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name,
            metadata: {
              productId,
              category: item.category ?? '',
              variations: JSON.stringify(item.variations || {}),
              weight: (item.weight ?? 0).toString()
            }
          },
          unit_amount: Math.round(itemPriceInCents) // Already in cents
        },
        quantity: itemQuantity
      })
    }

    // Add shipping as a line item if there's a cost
    if (shippingType && shippingType.rate > 0) {
      const shippingRate =
        typeof shippingType.rate === 'number'
          ? shippingType.rate
          : parseFloat(shippingType.rate)

      if (!isNaN(shippingRate) && shippingRate > 0) {
        line_items.push({
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Shipping - ${shippingType.title}`,
              metadata: {
                shippingId: shippingType.id,
                shippingTitle: shippingType.title
              }
            },
            unit_amount: Math.round(shippingRate * 100) // Convert dollars to cents
          },
          quantity: 1
        })
      }
    }

    // Ensure we have valid line items
    if (line_items.length === 0) {
      return new NextResponse('No valid items to checkout', { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      customer_creation: 'always',
      success_url: `${process.env.FRONTEND_STORE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart`,
      metadata: {
        storeId,
        shippingAddress: JSON.stringify(shippingAddress),
        shippingType: JSON.stringify(shippingType),
        currency,
        cartItems: JSON.stringify(cartItems)
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    logger.info('[CHECKOUT_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
