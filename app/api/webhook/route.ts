import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'

import shippoClient from '@/lib/shippo'

// type ItemsObject = {
//   [productId: string]: number | { [variationId: string]: number }
// }

const DISCORD_ORDER_WEBHOOK_URL = process.env.DISCORD_ORDER_WEBHOOK_URL!

const REVALIDATE_URL = process.env.FRONTEND_STORE_URL + '/api/revalidate'

type AddressType = {
  firstName: string
  lastName: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

function parseShippingAddress(shippingAddressJson: string): string {
  const shippingAddress: AddressType = JSON.parse(shippingAddressJson)
  const shippingAddressObject = `${shippingAddress.firstName} ${shippingAddress.lastName}
    ${shippingAddress.street}
    ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}
    ${shippingAddress.country}`

  return shippingAddressObject
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
  // console.log('Session:', session)
  // TODO: implement currency conversion
  // const currency = session?.currency
  const billingAddress = session?.customer_details?.address

  const billingAddressComponents = [
    billingAddress?.line1,
    billingAddress?.line2,
    billingAddress?.city,
    billingAddress?.state,
    billingAddress?.postal_code,
    billingAddress?.country
  ]

  const addressString = billingAddressComponents
    .filter((c) => c !== null)
    .join(', ')

  // Listen for the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId
      },
      data: {
        // isPaid: true,
        billingAddress: addressString,
        emailAddress: session?.customer_details?.email || '',
        totalPrice: session.amount_total ? session.amount_total / 100 : 0
      }
    })

    // Send Discord notification
    try {
      const productDetails = await prismadb.orderItem.findMany({
        where: {
          orderId: session.metadata?.orderId
        },
        include: {
          product: true,
          productVariation: true
        }
      })

      const parsedProductDetails = productDetails
        .map((product) => {
          return `${product.product.name} (${product.productVariation?.name}) x${product.quantity}`
        })
        .join('\n')

      const shippingAddress = parseShippingAddress(
        session.metadata?.shippingAddress || ''
      )

      const discordMessage = {
        embeds: [
          {
            title: 'New Order! 🎉',
            description: `**Order ID:**
            ${session?.metadata?.orderId}
            \n**Products:**
            ${parsedProductDetails}
            \n**Total:** 
            $${session.amount_total ? session.amount_total / 100 : 0}
            \n**Buyer's Name:**
            ${session?.customer_details?.name}
            \n**Shipping Address:**
            ${shippingAddress}
            \n**Email:**
            ${session?.customer_details?.email}`,
            color: 65280, // Color code in decimal (equivalent to #00ff00)
            timestamp: new Date().toISOString(),
            image: {
              url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG5sb211bTZkdzdmMTdtemRqZGo3bTRwb2Myb2QxcjhqdHVud29rMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QkqD1bx6bWtihO5als/giphy.gif'
            }
          }
        ]
      }

      await axios.post(DISCORD_ORDER_WEBHOOK_URL, discordMessage)
    } catch (error) {
      console.log('Error sending Discord notification:', error)
    }
  }

  // Listen for the payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    // console.log(paymentIntent)
    const orderId = paymentIntent.metadata.orderId

    await prismadb.order.update({
      where: {
        id: orderId
      },
      data: {
        isPaid: true
      }
    })

    // let shippingRate: Stripe.ShippingRate | undefined
    // try {
    //   const shippingID = session.shipping_cost?.shipping_rate

    //   shippingRate = await stripe.shippingRates.retrieve(shippingID as string)
    // } catch (error) {
    //   console.log(
    //     'Error retrieving shipping rate, so cannot create shipping label:',
    //     error
    //   )
    // }

    const shippingRateId = paymentIntent.metadata.shippingRateId

    if (shippingRateId) {
      try {
        shippoClient.transaction.create({
          rate: shippingRateId,
          label_file_type: 'PDF',
          async: false
        })
        // console.log(transaction)
      } catch (error) {
        // TODO: create webhook to alert admin of failed shipping label creation
        console.log('Error creating shipping label:', error)
      }
    }

    // revalidate product data
    await axios.post(
      REVALIDATE_URL,
      {
        tag: 'product'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REVALIDATE_TOKEN}`
        }
      }
    )
  }

  return new NextResponse(null, { status: 200 })
}
