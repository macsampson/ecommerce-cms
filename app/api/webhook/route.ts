import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'

import shippoClient from '@/lib/shippo'

// type ItemsObject = {
//   [productId: string]: number | { [variationId: string]: number }
// }

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
  // TODO: implement currency conversion
  // const currency = session?.currency
  const billingAddress = session?.customer_details?.address

  const billingAddressComponents = [
    billingAddress?.line1,
    billingAddress?.line2,
    billingAddress?.city,
    billingAddress?.state,
    billingAddress?.postal_code,
    billingAddress?.country,
  ]

  const addressString = billingAddressComponents
    .filter((c) => c !== null)
    .join(', ')

  // Listen for the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        // isPaid: true,
        billingAddress: addressString,
        emailAddress: session?.customer_details?.email || '',
        totalPrice: session.amount_total ? session.amount_total / 100 : 0,
      },
    })
  }

  // Listen for the payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    // console.log(paymentIntent)
    const orderId = paymentIntent.metadata.orderId

    await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
      },
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
          async: false,
        })
        // console.log(transaction)
      } catch (error) {
        // TODO: create webhook to alert admin of failed shipping label creation
        console.log('Error creating shipping label:', error)
      }
    }
  }

  return new NextResponse(null, { status: 200 })
}
