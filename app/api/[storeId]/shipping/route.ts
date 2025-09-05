// Import necessary dependencies and types
import { ProductVariation } from '@prisma/client'
import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'

// Helper function to format prices from cents to dollars with 2 decimal places
const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2)
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
  id: string
  name: string
  priceInCents: number
  weight: string
  bundles: { minQuantity: number; discountPercentage: number }[]
  cartQuantity: number
  variations: Record<string, ProductVariation>
  bundlePrice?: number
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

type CustomsDeclarationInfo = {
  items: {
    description: string
    mass_unit: string
    origin_country: string
    tariff_number: string
  }[]
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

  console.log('CART ITEMS: ', cartItems)

  const url = new URL(req.url)
  const storeId = url.pathname.split('/')[2]

  // Calculate total weight and price
  const totalWeight = cartItems.reduce(
    (acc, cartItem) => acc + Number(cartItem.weight) * cartItem.cartQuantity,
    0
  )

  const totalPrice = cartItems.reduce((acc, cartItem) => {
    console.log(cartItem)

    // Use bundlePrice if available (already calculated by frontend), otherwise calculate from base price
    if (cartItem.bundlePrice) {
      console.log('USING BUNDLE PRICE: ', cartItem.bundlePrice)
      return acc + cartItem.bundlePrice
    }

    const itemPrice = cartItem.priceInCents * cartItem.cartQuantity
    console.log('USING ITEM PRICE: ', itemPrice)
    console.log('PRICE: ', cartItem.priceInCents)
    console.log('QUANTITY: ', cartItem.cartQuantity)

    return acc + itemPrice
  }, 0)

  console.log('TOTAL PRICE: ', totalPrice)

  // Create line items for Shippo
  const lineItems = cartItems.map((cartItem) => ({
    title: cartItem.name,
    sku: cartItem.id,
    quantity: cartItem.cartQuantity,
    total_price: formatPrice(
      cartItem.bundlePrice || cartItem.priceInCents * cartItem.cartQuantity
    ),
    currency: currency,
    weight: (Number(cartItem.weight) * cartItem.cartQuantity).toString(),
    weight_unit: 'g',
    mass_unit: 'g',
    manufacture_country: 'CA'
  }))

  console.log('TOTAL WEIGHT: ', totalWeight)

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

  // Get sender address from database
  const shippingSettings = await prismadb.shippingSettings.findUnique({
    where: {
      storeId: storeId
    }
  })

  if (!shippingSettings) {
    return NextResponse.json(
      {
        success: false,
        error: 'Sender address not found'
      },
      { status: 404 }
    )
  }
  // Create customs declaration for international shipping

  const customsDeclarationInfo =
    shippingSettings.customsDeclaration as CustomsDeclarationInfo

  console.log(customsDeclarationInfo)

  if (!customsDeclarationInfo) {
    return NextResponse.json(
      {
        success: false,
        error: 'Customs declaration not found'
      },
      { status: 404 }
    )
  }

  const customsDeclaration =
    address.country !== 'CA'
      ? {
          ...customsDeclarationInfo,
          items: customsDeclarationInfo.items.map((item: any) => ({
            ...item,
            net_weight: totalWeight.toString(),
            quantity: cartItems.reduce(
              (acc, cartItem) => acc + cartItem.cartQuantity,
              0
            ),
            value_amount: formatPrice(totalPrice),
            value_currency: currency
          }))
        }
      : undefined

  // console.log('CUSTOMS DECLARATION: ', customsDeclaration)

  const shippoEnabled = shippingSettings.shippoEnabled
  const chitchatsEnabled = shippingSettings.chitchatsEnabled

  // Create shipment object
  const shipmentObject = {
    address_from: {
      name: shippingSettings.name,
      company: shippingSettings.company,
      street1: shippingSettings.street1,
      city: shippingSettings.city,
      state: shippingSettings.state,
      zip: shippingSettings.zip,
      country: shippingSettings.country,
      phone: shippingSettings.phone,
      email: shippingSettings.email,
      is_residential: false // or true, depending on your business
    },
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

        // console.log('SHIPPO RATES: ', shippoData.rates)

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
              phone: address.phone || '',
              email: address.email,
              description: cartItems
                .map((cartItem) => `${cartItem.cartQuantity}x Keycaps`)
                .join(', '),
              value: (totalPrice / 100)?.toString() || '0',
              value_currency: currency,
              package_type: 'thick_envelope',
              postage_type: 'unknown',
              size_unit: 'cm',
              size_x: 23,
              size_y: 16,
              size_z: 5,
              weight_unit: customsDeclarationInfo.items[0].mass_unit,
              weight: totalWeight || 0,
              is_insured: true,
              is_insurance_requested: true,
              ship_date: 'today',
              hs_tariff_code: customsDeclarationInfo.items[0].tariff_number,
              line_items: cartItems.map((cartItem) => ({
                quantity: cartItem.cartQuantity || 1,
                description: cartItem.name || 'Keycap',
                currency_code: currency,
                value_amount:
                  (
                    (cartItem.bundlePrice ||
                      cartItem.priceInCents * cartItem.cartQuantity) / 100
                  )?.toString() || '0',
                weight: cartItem.weight?.toString() || '1',
                weight_unit: customsDeclarationInfo.items[0].mass_unit,
                origin_country: customsDeclarationInfo.items[0].origin_country,
                hs_tariff_code: customsDeclarationInfo.items[0].tariff_number
              }))
            })
          }
        )
        const chitchatsData = await chitchatsResponse.json()

        // Check if the response has the expected structure
        if (
          !chitchatsData ||
          !chitchatsData.shipment ||
          !chitchatsData.shipment.rates
        ) {
          console.error(
            'ChitChats API returned unexpected response:',
            chitchatsData
          )
          return []
        }

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
      shippoEnabled ? getShippoRates() : [],
      chitchatsEnabled ? getChitChatsRates() : []
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
