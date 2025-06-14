// Import necessary dependencies and types
import { Product, ProductVariation } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import shippo, {
  CreateParcelRequest,
  CreateCustomsDeclarationRequest
} from 'shippo' // Shippo client initialization

// Helper function to format prices to 2 decimal places
const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

// Define the sender's address (TODO: Fetch this from the database in the future)
const addressFromCanada = {
  name: 'Pocket Caps',
  company: 'PocketCaps',
  street1: '3307 24 St NW',
  city: 'Calgary',
  state: 'AB',
  zip: 'T2M 3Z8',
  country: 'CA', // iso2 country code
  phone: '+17788289009',
  email: 'pocketcaps@gmail.com'
}

// Define types for address and cart items
type AddressType = {
  firstName: string
  lastName: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  email: string
  phone?: string
}

type CartItemType = {
  productId: string
  name: string
  price: number
  cartQuantity: number
  weight: number
  variations?: ProductVariation[]
  bundles?: { minQuantity: number; discount: number }[]
}

type ShippoRate = {
  object_id: string
  provider: string
  servicelevel: {
    name: string
    token: string
    display_name: string
  }
  amount: string
  currency: string
  amount_local: string
  currency_local: string
  estimated_days: number
  duration_terms: string
  attributes: string[]
  provider_image_200: string
}

type ShippoRatesResponse = {
  rates: ShippoRate[]
  messages: any[]
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({})
}

// Handle POST request for shipping rate calculation
export async function POST(req: Request) {
  const {
    address,
    cartItems,
    currency
  }: { address: AddressType; cartItems: CartItemType[]; currency: string } =
    await req.json()

  // Calculate total weight and price
  const totalWeight = cartItems.reduce(
    (acc, item) => acc + item.weight * item.cartQuantity,
    0
  )

  const totalPrice = cartItems.reduce((acc, item) => {
    const { price, cartQuantity, bundles } = item
    let itemPrice = price * cartQuantity

    if (bundles && cartQuantity > 1) {
      const sortedBundles = Object.entries(bundles).sort(
        ([a], [b]) => Number(a) - Number(b)
      )
      for (const [minQuantity, discount] of sortedBundles) {
        if (cartQuantity >= Number(minQuantity)) {
          itemPrice = price * cartQuantity * (1 - Number(discount) / 100)
          break
        }
      }
    }
    return acc + itemPrice
  }, 0)

  // Create line items for Shippo
  const lineItems = cartItems.map((item) => ({
    title: item.name,
    sku: item.productId,
    quantity: item.cartQuantity,
    total_price: formatPrice(item.price * item.cartQuantity),
    currency: currency,
    weight: (item.weight * item.cartQuantity).toString(),
    weight_unit: 'g',
    mass_unit: 'g',
    manufacture_country: 'CA'
  }))

  // Create parcel data
  const parcelData = {
    length: '23',
    width: '16',
    height: '5',
    distance_unit: 'cm',
    weight: totalWeight.toString(),
    weight_unit: 'g',
    mass_unit: 'g'
  }

  // Create customs declaration for international shipping
  const customsDeclaration =
    address.country !== 'CA'
      ? {
          certify: true,
          certify_signer: 'PocketCaps',
          contents_explanation: 'Keyboard Keycaps',
          contents_type: 'MERCHANDISE',
          eel_pfc: 'NOEEI_30_36',
          incoterm: 'DDP',
          items: [
            {
              description: 'Keyboard Keycaps',
              mass_unit: 'g',
              net_weight: totalWeight.toString(),
              origin_country: 'CA',
              quantity: cartItems.reduce(
                (acc, item) => acc + item.cartQuantity,
                0
              ),
              tarrif_number: '3926.90',
              value_amount: formatPrice(totalPrice),
              value_currency: currency
            }
          ],
          non_delivery_option: 'RETURN'
        }
      : undefined

  // Create shipment object
  const shipmentObject = {
    address_from: addressFromCanada,
    address_to: {
      name: `${address.firstName} ${address.lastName}`,
      street1: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      email: address.email,
      phone: address.phone,
      is_residential: true
    },
    parcels: [parcelData],
    async: false,
    customs_declaration: customsDeclaration,
    line_items: lineItems
  }

  // console.log('shipmentObject: ', shipmentObject)

  try {
    // Create separate functions for each shipping provider
    const getShippoRates = async () => {
      try {
        const shippoResponse = await fetch(
          'https://api.goshippo.com/shipments/',
          {
            method: 'POST',
            headers: {
              Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(shipmentObject)
          }
        )
        const shippoData = await shippoResponse.json()

        return shippoData.rates.map((rate: ShippoRate) => ({
          id: rate.object_id,
          provider: 'Shippo',
          title:
            rate.servicelevel.display_name ||
            `${rate.provider} ${rate.servicelevel.name}`,
          description:
            rate.duration_terms ||
            (rate.estimated_days &&
              `${rate.estimated_days} day${
                rate.estimated_days !== 1 ? 's' : ''
              } delivery`) ||
            'Exact delivery estimate not available',
          amount: rate.amount,
          currency: rate.currency,
          amount_local: rate.amount_local,
          currency_local: rate.currency_local,
          estimated_days: rate.estimated_days,
          attributes: rate.attributes,
          provider_image: rate.provider_image_200
        }))
      } catch (error) {
        console.error('Shippo rate error:', error)
        return []
      }
    }

    const getChitChatsRates = async () => {
      try {
        const chitchatsResponse = await fetch(
          `${process.env.CHITCHATS_API_URL}/api/v1/clients/${process.env.CHITCHATS_CLIENT_ID}/shipments`,
          {
            method: 'POST',
            headers: {
              Authorization: process.env.CHITCHATS_API_KEY!,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: `${address.firstName} ${address.lastName}`,
              address_1: address.street,
              city: address.city,
              province_code: address.state,
              postal_code: address.zip,
              country_code: address.country,
              phone: address.phone,
              email: address.email,
              description: cartItems
                .map((item) => `${item.cartQuantity}x Keycaps`)
                .join(', '),
              value: totalPrice.toString(),
              value_currency: currency,
              package_type: 'thick_envelope',
              postage_type: 'unknown',
              size_unit: 'cm',
              size_x: 23,
              size_y: 16,
              size_z: 5,
              weight_unit: 'g',
              weight: totalWeight,
              is_insured: true,
              is_insurance_requested: true,
              ship_date: 'today',
              line_items: cartItems.map((item) => ({
                quantity: item.cartQuantity,
                description: item.name,
                currency_code: currency,
                value_amount: item.price.toString(),
                weight: item.weight.toString(),
                weight_unit: 'g',
                origin_country: 'CA',
                hs_tariff_code: '3926.90'
              }))
            })
          }
        )
        const chitchatsData = await chitchatsResponse.json()

        // Delete shipment until customer makes purchase
        if (chitchatsData.shipment && chitchatsData.shipment.id) {
          try {
            await fetch(
              `${process.env.CHITCHATS_API_URL}/api/v1/clients/${process.env.CHITCHATS_CLIENT_ID}/shipments/${chitchatsData.shipment.id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: process.env.CHITCHATS_API_KEY!
                }
              }
            )
          } catch (deleteError) {
            console.error('Failed to delete temporary shipment:', deleteError)
            // Non-critical error, continue with returning rates
          }
        }

        const rates = chitchatsData.shipment.rates.map((rate: any) => ({
          id: `${rate.postage_type}`,
          provider: 'Chit Chats',
          title: rate.postage_description,
          description: rate.delivery_time_description,
          amount: rate.payment_amount,
          currency: currency,
          amount_local: rate.payment_amount,
          currency_local: currency,
          estimated_days: parseInt(
            rate.delivery_time_description.match(/\d+/)?.[0] || '0'
          ),
          attributes: [
            rate.tracking_type_description,
            rate.is_insured ? 'Insured' : null,
            rate.signature_confirmation_description,
            rate.delivery_duties_paid_description
          ].filter(Boolean),
          provider_image:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwF9SOKaw4zLDp3zdkLiezZRMqaHARJooA-g&s'
        }))

        // Filter out Canada Post rates
        return rates.filter((rate: any) => !rate.title.includes('Canada Post'))
      } catch (error) {
        console.error('Chit Chats rate error:', error)
        return []
      }
    }

    // Get rates from both providers in parallel
    const [shippoRates, chitchatsRates] = await Promise.all([
      getShippoRates(),
      getChitChatsRates()
    ])

    // Combine and sort all rates by price
    const allRates = [...shippoRates, ...chitchatsRates].sort(
      (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
    )

    return NextResponse.json({
      success: true,
      rates: allRates
    })

    // console.log('shipmentData: ', shipmentData.rates)

    // Format rates for frontend display
    // const formattedRates = shipmentData.rates
    // .filter((rate: ShippoRate) => {
    // For US addresses, only show 'Tracked Packet - USA'
    // if (address.country === 'US') {
    //   return (
    //     rate.servicelevel.name === 'Tracked Packet - USA' ||
    //     rate.servicelevel.name === 'Expedited Parcel USA'
    //   )
    // }
    // // For Canadian addresses, show all available rates with valid estimated days
    // if (address.country === 'CA') {
    //   return (
    //     rate.servicelevel?.name &&
    //     rate.estimated_days !== null &&
    //     rate.estimated_days !== undefined &&
    //     rate.servicelevel.name !== 'Xpresspost' &&
    //     rate.servicelevel.name !== 'Regular Parcel'
    //   )
    // }
    // // For other countries, show all available rates with valid estimated days
    // return (
    //   rate.servicelevel?.name &&
    //   rate.estimated_days !== null &&
    //   rate.estimated_days !== undefined
    // )
    // })
    //   .map((rate: ShippoRate) => ({
    //     id: rate.object_id,
    //     title:
    //       rate.servicelevel.display_name ||
    //       `${rate.provider} ${rate.servicelevel.name}`,
    //     description:
    //       rate.duration_terms ||
    //       `${rate.estimated_days} day${
    //         rate.estimated_days !== 1 ? 's' : ''
    //       } delivery`,
    //     amount: rate.amount,
    //     currency: rate.currency,
    //     amount_local: rate.amount_local,
    //     currency_local: rate.currency_local,
    //     estimated_days: rate.estimated_days,
    //     attributes: rate.attributes,
    //     provider_image: rate.provider_image_200
    //   }))
    //   .sort(
    //     (a: ShippoRate, b: ShippoRate) =>
    //       parseFloat(a.amount) - parseFloat(b.amount)
    //   )

    // return NextResponse.json({
    //   success: true,
    //   rates: formattedRates
    // })
  } catch (error) {
    console.error('Shipping rate error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shipping rates'
      },
      { status: 500 }
    )
  }
}

//   // Send request to Shippo API to get live rates
//   try {
//     const response = await fetch('https://api.goshippo.com/live-rates', {
//       method: 'POST',
//       headers: {
//         Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(shipmentObject)
//     })

//     const data: ShippoRatesResponse = await response.json()
//     console.log('data: ', data)

//     // Format the rates for frontend display
//     if (data.results && data.results.length > 0) {
//       let rates = data.results

//       // If shipping to Canada but no domestic rates returned, add fallback options
//       if (
//         address.country === 'CA' &&
//         (!rates.length || rates[0].title.includes('USA'))
//       ) {
//         rates = [
//           {
//             title: 'Canada Post Regular Parcel',
//             description: 'Domestic shipping within Canada',
//             amount: '2.00',
//             currency: 'CAD',
//             amount_local: '2.00',
//             currency_local: 'CAD',
//             estimated_days: 5
//           },
//           {
//             title: 'Canada Post Expedited Parcel',
//             description: 'Faster domestic shipping within Canada',
//             amount: '13.00',
//             currency: 'CAD',
//             amount_local: '13.00',
//             currency_local: 'CAD',
//             estimated_days: 3
//           }
//         ]
//       }

//       const formattedRates = rates.map((rate) => ({
//         id: `${rate.title}-${rate.amount}`.toLowerCase().replace(/\s+/g, '-'), // Create a unique ID
//         title: rate.title,
//         amount: rate.amount,
//         currency: rate.currency,
//         amount_local: rate.amount_local,
//         currency_local: rate.currency_local,
//         estimated_days: rate.estimated_days,
//         description: rate.description
//       }))

//       // Sort rates by price
//       formattedRates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))

//       // console.log('formattedRates: ', formattedRates)

//       return NextResponse.json({
//         success: true,
//         rates: formattedRates
//       })
//     } else {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'No shipping rates available'
//         },
//         { status: 400 }
//       )
//     }
//   } catch (error) {
//     console.error('Shipping rate error:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Failed to fetch shipping rates'
//       },
//       { status: 500 }
//     )
//   }
// }
