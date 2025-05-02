// Import necessary dependencies and types
import { Product, ProductVariation } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import shippo, {
  CreateParcelRequest,
  CreateCustomsDeclarationRequest
} from 'shippo' // Shippo client initialization

// Define the sender's address (TODO: Fetch this from the database in the future)
const addressFromCanada = {
  name: 'Pocket Caps',
  company: 'PocketCaps',
  street1: '4730 Lougheed Hwy',
  city: 'Burnaby',
  state: 'BC',
  zip: 'v6e 0m9',
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
  phone: string
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
    total_price: (item.price * item.cartQuantity).toString(),
    currency: currency,
    weight: (item.weight * item.cartQuantity).toString(),
    weight_unit: 'g',
    mass_unit: 'g',
    manufacture_country: 'CA'
  }))

  // Create parcel data
  const parcelData = {
    length: '20',
    width: '15',
    height: '10',
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
              value_amount: totalPrice.toString(),
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

  try {
    // Create shipment and get rates
    const shipmentResponse = await fetch(
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

    const shipmentData = await shipmentResponse.json()

    if (!shipmentData.rates) {
      throw new Error('No rates returned from Shippo')
    }

    // console.log('shipmentData: ', shipmentData.rates)

    // Format rates for frontend display
    const formattedRates = shipmentData.rates
      .filter((rate: ShippoRate) => {
        // For US addresses, only show 'Tracked Packet - USA'
        if (address.country === 'US') {
          return rate.servicelevel.name === 'Tracked Packet - USA'
        }

        // For Canadian addresses, show all available rates with valid estimated days
        if (address.country === 'CA') {
          return (
            rate.servicelevel?.name &&
            rate.estimated_days !== null &&
            rate.estimated_days !== undefined &&
            rate.servicelevel.name !== 'Xpresspost' &&
            rate.servicelevel.name !== 'Regular Parcel'
          )
        }

        // For other countries, show all available rates with valid estimated days
        return (
          rate.servicelevel?.name &&
          rate.estimated_days !== null &&
          rate.estimated_days !== undefined
        )
      })
      .map((rate: ShippoRate) => ({
        id: rate.object_id,
        title:
          rate.servicelevel.display_name ||
          `${rate.provider} ${rate.servicelevel.name}`,
        description:
          rate.duration_terms ||
          `${rate.estimated_days} day${
            rate.estimated_days !== 1 ? 's' : ''
          } delivery`,
        amount: rate.amount,
        currency: rate.currency,
        amount_local: rate.amount_local,
        currency_local: rate.currency_local,
        estimated_days: rate.estimated_days,
        attributes: rate.attributes,
        provider_image: rate.provider_image_200
      }))
      .sort(
        (a: ShippoRate, b: ShippoRate) =>
          parseFloat(a.amount) - parseFloat(b.amount)
      )

    return NextResponse.json({
      success: true,
      rates: formattedRates
    })
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
