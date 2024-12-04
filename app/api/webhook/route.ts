import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'

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
            ${session?.customer_details?.email}
            \n@everyone`,
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

    try {
      // get line items from stripe session
      const checkoutSessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id
      })
      // console.log('Checkout sessions:', checkoutSessions)

      if (checkoutSessions.data.length === 0) {
        return new NextResponse('No checkout sessions found', { status: 404 })
      }

      const checkoutSession = checkoutSessions.data[0]

      await prismadb.order.update({
        where: {
          id: orderId
        },
        data: {
          isPaid: true
        }
      })

      // get line items from stripe session
      const lineItemsObject = await stripe.checkout.sessions.listLineItems(
        checkoutSession.id,
        {
          limit: 100
        }
      )

      const lineItems = lineItemsObject.data.map((item) => {
        // console.log('Item:', item)
        return {
          title: item.description,
          quantity: item.quantity,
          total_price: item.amount_total / 100
        }
      })

      const chitChatLineItems = lineItems.map((item) => {
        // console.log('Chit chat item:', item)

        return {
          quantity: item.quantity,
          description: item.title,
          value_amount: item.total_price / (item.quantity || 1),
          currency_code: 'usd'
        }
      })

      const checkoutSessionAddress = checkoutSession.customer_details?.address

      // Create Chit Chats shipment object
      const chitChatsShipment = {
        name: `${checkoutSession.customer_details?.name}`,
        address_1: checkoutSession.customer_details?.address?.line1,
        address_2: checkoutSession.customer_details?.address?.line2,
        city: checkoutSession.customer_details?.address?.city,
        province_code: checkoutSession.customer_details?.address?.state,
        postal_code: checkoutSession.customer_details?.address?.postal_code,
        country_code: checkoutSession.customer_details?.address?.country,
        phone: checkoutSession.customer_details?.phone?.replace(/\D/g, ''), // Remove non-numeric characters
        email: checkoutSession.customer_details?.email,
        package_contents: 'merchandise',
        description: 'Keyboard Keycaps',
        value: checkoutSession.amount_total
          ? checkoutSession.amount_total / 100
          : 0,
        value_currency: 'usd',
        order_id: '', // TODO: Add order ID
        // order_store: 'other',
        package_type: 'thick_envelope',
        weight_unit: 'g',
        weight: checkoutSession.metadata?.totalWeight,
        size_unit: 'cm',
        size_x: 23,
        size_y: 16,
        size_z: 5,
        insurance_requested: true,
        signature_requested: false,
        vat_reference: '',
        // duties_paid_requested: false,
        // postage_type:
        //   checkoutSessionAddress?.country === 'US'
        //     ? 'chit_chats_us_edge'
        //     : 'chit_chats_select',
        // cheapest_postage_type_requested: 'yes',
        // tracking_number: '',
        // ship_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        //   .toISOString()
        //   .split('T')[0],
        line_items: chitChatLineItems
      }

      console.log('Chit Chats shipment:', chitChatsShipment)

      // Send request to Chit Chats API
      try {
        const response = await fetch(
          `${process.env.CHIT_CHATS_API_URL}/${process.env.CHIT_CHATS_CLIENT_ID}/shipments`,
          {
            method: 'POST',
            headers: {
              Authorization: `${process.env.CHIT_CHATS_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(chitChatsShipment)
          }
        )

        const data = await response.json()
        console.log('Chit Chats shipment created:', data)
        // return NextResponse.json(data, { status: 200 })
      } catch (error) {
        console.error('Chit Chats API Error:', error)
        // return new NextResponse('Internal Server Error', { status: 500 })
      }

      //   const shippingAddress = {
      //     name: checkoutSession.customer_details?.name,
      //     street1: checkoutSession.customer_details?.address?.line1,
      //     city: checkoutSession.customer_details?.address?.city,
      //     state: checkoutSession.customer_details?.address?.state,
      //     zip: checkoutSession.customer_details?.address?.postal_code,
      //     country: checkoutSession.customer_details?.address?.country
      //   }

      //   console.log('Total Weight: ', checkoutSession.metadata?.totalWeight)
      //   console.log('Currency: ', checkoutSession.currency)
      //   // Create an order in shippo
      //   const order = {
      //     to_address: shippingAddress,
      //     line_items: lineItems,
      //     // get date from unix timestamp
      //     placed_at: new Date(checkoutSession.created * 1000).toISOString(),
      //     order_number: checkoutSession?.metadata?.orderId,
      //     order_status: 'PAID',
      //     shipping_cost: Number(checkoutSession?.shipping_cost?.amount_total)
      //       ? Number(checkoutSession?.shipping_cost?.amount_total) / 100
      //       : 0,
      //     shipping_cost_currency: checkoutSession.currency?.toUpperCase(),
      //     // shipping_method: checkoutSession?.shipping_options, //todo
      //     subtotal_price: checkoutSession.amount_subtotal
      //       ? checkoutSession.amount_subtotal / 100
      //       : 0,
      //     total_price: checkoutSession.amount_total
      //       ? checkoutSession.amount_total / 100
      //       : 0,
      //     total_tax: checkoutSession.total_details?.amount_tax
      //       ? checkoutSession.total_details.amount_tax / 100
      //       : 0,
      //     currency: checkoutSession.currency?.toUpperCase(),
      //     weight: checkoutSession.metadata?.totalWeight,
      //     weight_unit: 'g'
      //   }

      //   console.log('Order:', order)

      //   // call shippo API to create order
      //   try {
      //     const res = await fetch('https://api.goshippo.com/orders/', {
      //       method: 'POST',
      //       headers: {
      //         Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify(order)
      //     })
      //     // console.log('Shippo order created:', res)
      //   } catch (error) {
      //     console.log('Error creating order in Shippo:', error)
      //   }
      // } catch (error) {
      //   console.log('Error updating order:', error)
      // }
    } catch (error) {
      console.log('Error updating order:', error)
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
