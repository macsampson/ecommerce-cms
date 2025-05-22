import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'

const DISCORD_ORDER_WEBHOOK_URL = process.env.DISCORD_ORDER_WEBHOOK_URL!

const REVALIDATE_URL = process.env.FRONTEND_STORE_URL + '/api/revalidate'

// Helper function to format prices to 2 decimal places
const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

type AddressType = {
  firstName: string
  lastName: string
  street: string
  apartment: string
  city: string
  state: string
  zip: string
  country: string
  email: string
  phone: string
}

const fromAddress = {
  name: 'Pocket Caps',
  company: 'PocketCaps',
  street1: '3307 24 St NW',
  city: 'Calgary',
  state: 'AB',
  zip: 'T2M 3Z8',
  country: 'CA',
  phone: '17788289009',
  email: 'pocketcaps@gmail.com'
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
            $${formatPrice(
              session.amount_total ? session.amount_total / 100 : 0
            )}
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

    return new NextResponse(null, { status: 200 })
  }

  // Listen for the payment_intent.succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderIdFromPaymentIntent = paymentIntent.metadata.orderId

    try {
      // Get line items from stripe session
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
          id: orderIdFromPaymentIntent
        },
        data: {
          isPaid: true
        }
      })

      // --- Create Chit Chats Shipment if applicable ---
      const shippingRateTitle =
        checkoutSession.metadata?.shippingRateTitle || ''
      const selectedPostageType = checkoutSession.metadata?.shippingRateId || '' // Assuming this ID is the postage_type for Chit Chats

      if (
        shippingRateTitle.toLowerCase().includes('chit chats') &&
        selectedPostageType
      ) {
        console.log(
          `Attempting to create Chit Chats shipment for Order ID: ${orderIdFromPaymentIntent}`
        )

        const dbOrder = await prismadb.order.findUnique({
          where: { id: orderIdFromPaymentIntent },
          include: { orderItems: { include: { product: true } } } // Include product for details if needed
        })

        if (!dbOrder) {
          console.error(
            `Webhook: Order ${orderIdFromPaymentIntent} not found in DB for Chit Chats shipment creation.`
          )
          // Continue other webhook processing if necessary, but log this error
        } else {
          const shippingAddressString =
            checkoutSession.metadata?.shippingAddress
          let parsedShippingAddress: AddressType | null = null
          if (shippingAddressString) {
            try {
              parsedShippingAddress = JSON.parse(
                shippingAddressString
              ) as AddressType
            } catch (e) {
              console.error(
                'Webhook: Failed to parse shippingAddress from metadata',
                e
              )
            }
          }

          // Fallback or primary source for address details
          const custDetails = checkoutSession.customer_details
          const finalShippingAddress = {
            firstName:
              parsedShippingAddress?.firstName ||
              custDetails?.name?.split(' ')[0] ||
              '',
            lastName:
              parsedShippingAddress?.lastName ||
              custDetails?.name?.split(' ').slice(1).join(' ') ||
              '',
            street:
              parsedShippingAddress?.street ||
              custDetails?.address?.line1 ||
              '',
            apartment:
              parsedShippingAddress?.apartment ||
              custDetails?.address?.line2 ||
              '',
            city:
              parsedShippingAddress?.city || custDetails?.address?.city || '',
            state:
              parsedShippingAddress?.state || custDetails?.address?.state || '',
            zip:
              parsedShippingAddress?.zip ||
              custDetails?.address?.postal_code ||
              '',
            country:
              parsedShippingAddress?.country ||
              custDetails?.address?.country ||
              '',
            email: custDetails?.email || parsedShippingAddress?.email || '',
            phone: custDetails?.phone || parsedShippingAddress?.phone || ''
          }

          const totalOrderWeight = parseFloat(
            checkoutSession.metadata?.totalWeight || '0'
          )
          const orderCurrency = (
            checkoutSession.currency || 'usd'
          ).toUpperCase()
          const orderTotalPrice = (checkoutSession.amount_total || 0) / 100

          const chitChatsShipmentPayload = {
            name: `${finalShippingAddress.firstName} ${finalShippingAddress.lastName}`,
            address_1: finalShippingAddress.street,
            address_2: finalShippingAddress.apartment,
            city: finalShippingAddress.city,
            province_code: finalShippingAddress.state,
            postal_code: finalShippingAddress.zip,
            country_code: finalShippingAddress.country,
            phone: finalShippingAddress.phone,
            email: finalShippingAddress.email,
            package_contents: 'merchandise',
            description:
              dbOrder.orderItems
                .map((item) => `${item.quantity}x ${item.name}`)
                .join(', ') || 'Order items',
            value: formatPrice(orderTotalPrice),
            value_currency: orderCurrency,
            package_type: 'parcel', // Adjust if needed, e.g., thick_envelope
            postage_type: selectedPostageType,
            size_unit: 'cm', // Default, adjust if package dimensions vary
            size_x: 23,
            size_y: 16,
            size_z: 5,
            weight_unit: 'g',
            weight: totalOrderWeight,
            insurance_requested: true, // Or make configurable
            ship_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for today
            line_items: dbOrder.orderItems.map((item) => ({
              quantity: item.quantity,
              description: item.name,
              value_amount: formatPrice(parseFloat(item.price.toString())),
              currency_code: orderCurrency,
              hs_tariff_code: '3926.90', // Use a default or store HS code on product
              origin_country: 'CA' // Use a default or store on product
            }))
          }

          try {
            const CHITCHATS_API_URL = process.env.CHITCHATS_API_URL
            const CHITCHATS_CLIENT_ID = process.env.CHITCHATS_CLIENT_ID
            const CHITCHATS_API_KEY = process.env.CHITCHATS_API_KEY

            if (!CHITCHATS_CLIENT_ID || !CHITCHATS_API_KEY) {
              throw new Error('Chit Chats API credentials are not configured.')
            }

            const ccResponse = await fetch(
              `${CHITCHATS_API_URL}/api/v1/clients/${CHITCHATS_CLIENT_ID}/shipments`,
              {
                method: 'POST',
                headers: {
                  Authorization: CHITCHATS_API_KEY,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(chitChatsShipmentPayload)
              }
            )
            const ccResponseData = await ccResponse.json()

            if (!ccResponse.ok || ccResponseData.error) {
              console.error(
                'Chit Chats Create Shipment API Error:',
                ccResponseData.error || ccResponse.statusText,
                'Payload:',
                JSON.stringify(chitChatsShipmentPayload)
              )
              // Log error but don't fail the webhook for this
            } else {
              console.log(
                `Chit Chats shipment created for Order ID ${orderIdFromPaymentIntent}: ${ccResponseData.shipment?.id}`
              )
              // await prismadb.order.update({
              //   where: { id: orderIdFromPaymentIntent },
              //   data: {
              //     chitchatsShipmentId: ccResponseData.shipment?.id,
              //     chitchatsShipmentStatus: ccResponseData.shipment?.status
              //   }
              // })
            }
          } catch (ccError: any) {
            console.error(
              `Webhook: Error creating Chit Chats shipment for Order ID ${orderIdFromPaymentIntent}:`,
              ccError.message,
              'Payload:',
              JSON.stringify(chitChatsShipmentPayload)
            )
          }
        }
      } else {
        // Get line items from stripe session
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
            total_price: formatPrice(item.amount_total / 100),
            sku: item.price?.product as string,
            weight: checkoutSession.metadata?.totalWeight
              ? Number(checkoutSession.metadata.totalWeight) /
                (item.quantity || 1)
              : 0,
            weight_unit: 'g',
            currency: checkoutSession.currency?.toUpperCase(),
            manufacture_country: 'CA',
            max_ship_time: new Date(
              new Date().setDate(new Date().getDate() + 7)
            ).toISOString()
          }
        })

        const shippingAddress = {
          name: checkoutSession.customer_details?.name,
          street1: checkoutSession.customer_details?.address?.line1,
          street2: checkoutSession.customer_details?.address?.line2,
          city: checkoutSession.customer_details?.address?.city,
          state: checkoutSession.customer_details?.address?.state,
          zip: checkoutSession.customer_details?.address?.postal_code,
          country: checkoutSession.customer_details?.address?.country,
          phone: checkoutSession.customer_details?.phone || '',
          email: checkoutSession.customer_details?.email
        }

        // Inside payment_intent.succeeded event handler
        const shippingMethod = checkoutSession.metadata?.shippingRateTitle
        const isInternational = shippingAddress.country !== 'CA'

        // Create customs declaration for international shipping
        const customsDeclaration = isInternational
          ? {
              certify: true,
              certify_signer: 'PocketCaps',
              contents_explanation: 'Keyboard Keycaps',
              contents_type: 'MERCHANDISE',
              eel_pfc: 'NOEEI_30_36',
              incoterm: 'DDU',
              address_importer: fromAddress,
              items: lineItems.map((item) => ({
                description: item.title,
                mass_unit: 'g',
                net_weight: item.weight,
                origin_country: 'CA',
                quantity: item.quantity,
                hs_code: '3926.90.99',
                tarrif_number: '3926.90.99',
                value_amount: Number(item.total_price) * (item.quantity || 1),
                value_currency: checkoutSession.currency?.toUpperCase()
              })),
              non_delivery_option: 'RETURN'
            }
          : undefined

        // Create Shippo order
        const shippoOrder = {
          to_address: shippingAddress,
          from_address: fromAddress,
          line_items: lineItems,
          placed_at: new Date(checkoutSession.created * 1000).toISOString(),
          order_number: checkoutSession?.metadata?.orderId,
          order_status: 'PAID',
          shipping_cost: formatPrice(
            Number(checkoutSession.metadata?.shippingRateAmount) || 0
          ),
          shipping_cost_currency: checkoutSession.currency?.toUpperCase(),
          shipping_method: shippingMethod,
          subtotal_price: formatPrice(
            checkoutSession.amount_subtotal
              ? checkoutSession.amount_subtotal / 100
              : 0
          ),
          total_price: formatPrice(
            checkoutSession.amount_total
              ? checkoutSession.amount_total / 100 +
                  Number(checkoutSession.metadata?.shippingRateAmount)
              : 0
          ),
          total_tax: formatPrice(
            checkoutSession.total_details?.amount_tax
              ? checkoutSession.total_details.amount_tax / 100
              : 0
          ),
          currency: checkoutSession.currency?.toUpperCase(),
          weight: parseFloat(
            checkoutSession.metadata?.totalWeight || '0'
          ).toFixed(2),
          weight_unit: 'g',
          customs_declaration: customsDeclaration
        }

        // console.log('Shippo order:', shippoOrder)

        // Create order in Shippo
        try {
          const response = await fetch('https://api.goshippo.com/orders/', {
            method: 'POST',
            headers: {
              Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...shippoOrder
              // test: true // Enable test mode
            })
          })

          const data = await response.json()

          if (!response.ok) {
            console.error('Shippo API Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data
            })
            throw new Error(
              `Shippo API Error: ${data.detail || JSON.stringify(data)}`
            )
          }

          // console.log('Shippo order created successfully:', {
          //   orderId: data.object_id,
          //   orderNumber: data.order_number,
          //   status: data.order_status
          // })
        } catch (error) {
          console.error('Error creating order in Shippo:', error)
          // Log the full error details for debugging
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            })
          }
        }
      }

      // Revalidate product data
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
    } catch (error) {
      console.log('Error updating order:', error)
    }

    return new NextResponse(null, { status: 200 })
  }

  // Add a default response for any other event types or unhandled paths
  return new NextResponse(null, { status: 200 })
}
