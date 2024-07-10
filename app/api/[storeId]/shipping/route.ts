import { Product, ProductVariation } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import shippo, {
  CreateParcelRequest,
  CreateCustomsDeclarationRequest
} from 'shippo' // Shippo client initialization

import shippoClient from '@/lib/shippo'

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

const addressFromUS = {
  name: 'Pocket Caps',
  company: 'PocketCaps',
  street1: '532 19th Ave',
  city: 'Seattle',
  state: 'WA',
  zip: '98122',
  country: 'US', // iso2 country code
  phone: '',
  email: 'pocketcaps@gmail.com'
}

// const SHIPPO_LIVE_RATES_ENDPOINT = "https://api.goshippo.com/live-rates"

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
  variations?: ProductVariation[]
  bundles?: { minQuantity: number; discount: number }[]
}

export async function OPTIONS() {
  return NextResponse.json({})
}

export async function POST(req: Request) {
  const {
    address,
    cartItems
  }: { address: AddressType; cartItems: CartItemType[] } = await req.json()

  const totalQuantity = cartItems.reduce((acc, cartItem) => {
    const { cartQuantity } = cartItem
    return acc + cartQuantity
  }, 0)

  const totalValue = cartItems.reduce((acc, cartItem) => {
    const { price, cartQuantity, bundles } = cartItem

    return acc + price * totalQuantity
  }, 0)

  // keycap weight is 10g
  const totalWeight = totalQuantity * 0.01

  // create line items for shippo from cart items
  const lineItems = cartItems.map((cartItem) => {
    const { productId, name, price, cartQuantity, variations } = cartItem

    const lineItem = {
      currency: 'USD',
      manufacture_country: 'CA',
      // date 2 weeks from now that item needs to be delivered by
      max_delivery_time: new Date(Date.now() + 12096e5).toISOString(),
      // date 1 week from now that item needs to be shipped by
      max_ship_time: new Date(Date.now() + 6048e5).toISOString(),
      quantity: totalQuantity,
      sku: productId,
      title: name,
      total_price: price,
      weight: '10',
      weight_unit: 'g',
      object_id: productId
    }

    return lineItem
  })

  //   console.log(lineItems)
  // Construct the address object for Shippo

  // const carrierAccounts = await shippoClient.carrieraccount.list()
  // console.log(carrierAccounts)

  const parcels = await fetch(
    'https://api.goshippo.com/live-rates/settings/parcel-template',
    {
      method: 'GET',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  ).then((res) => res.json())

  const parcel = parcels.result

  const customsDeclaration = {
    certify: true,
    certify_signer: 'PocketCaps',
    contents_explanation: 'Keyboard Keycap',
    contents_type: 'MERCHANDISE',
    eel_pfc: 'NOEEI_30_36',
    incoterm: 'DDP',
    is_vat_collected: null,
    items: [
      {
        description: 'Keyboard Keycap',
        mass_unit: 'g',
        // "metadata": "Order ID \"123454\"",
        net_weight: totalWeight.toString(),
        origin_country: 'CA',
        quantity: totalQuantity,
        tarrif_number: '3926.90',
        value_amount: totalValue.toString(),
        value_currency: 'USD'
      }
    ],
    non_delivery_option: 'RETURN',
    address_importer: {
      name: 'Mackenzie Sampson',
      company: 'PocketCaps',
      street1: '4730 Lougheed Hwy',
      street2: 'Unit 302',
      city: 'Burnaby',
      state: 'BC',
      zip: 'v5c0m9',
      country: 'CA',
      phone: '+17788289009',
      email: 'pocketcaps@gmail.com',
      is_residential: true
    }
    // test: true
  } as CreateCustomsDeclarationRequest

  const shipmentObject = {
    address_from: addressFromCanada,
    address_to: {
      // Only state and zip might be sufficient for an estimate
      name: address.firstName + ' ' + address.lastName,
      street1: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      email: address.email,
      phone: address.phone
    },
    parcel: parcel.object_id,
    async: true,
    // carrier_accounts: ["dca6c762810f40658ae52cf86b455efd"],
    customs_declaration: customsDeclaration,
    // parcels: ["dca6c762810f40658ae52cf86b455efd"],
    line_items: lineItems
  }

  // console.log('shipment ', shipmentObject)

  // console.log("shipping ", shipmentObject)

  // try {
  //   const shipment = await shippoClient.shipment.create(shipmentObject)
  //   // console.log(shipment)
  //   return NextResponse.json(shipment, { status: 200 })
  // } catch (error) {
  //   console.log(error)
  //   return new NextResponse('Error fetching shipping rates', {
  //     status: 500
  //   })
  // }

  // LIVE RATES ENDPOINT

  try {
    // create axios post request to shippo to get live rates
    const data = await fetch('https://api.goshippo.com/live-rates', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shipmentObject)
    }).then((res) => res.json())

    // console.log('response', data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Server Error', {
      status: 500
    })
  }
}
