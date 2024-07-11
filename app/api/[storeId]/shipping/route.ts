import { Product, ProductVariation } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import shippo, {
  CreateParcelRequest,
  CreateCustomsDeclarationRequest
} from 'shippo' // Shippo client initialization

import shippoClient from '@/lib/shippo'
import { ca } from 'date-fns/locale'

// todo: get address from db
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

export async function OPTIONS() {
  return NextResponse.json({})
}

export async function POST(req: Request) {
  const {
    address,
    cartItems
  }: { address: AddressType; cartItems: CartItemType[] } = await req.json()

  // console.log('Cart Items:', cartItems)

  // create line items for shippo from cart items
  const lineItems = cartItems.map((cartItem) => {
    const {
      productId,
      name,
      price,
      cartQuantity,
      variations,
      weight,
      bundles
    } = cartItem

    // calculate the price of the item based on the quantity and any bundles that apply
    let itemsPrice = 0
    if (bundles && cartQuantity > 1) {
      let bundle = null
      // sort bundles by key and find the largest minQuantity that is less than or equal to the cartQuantity
      const sortedBundles = Object.entries(bundles).sort(
        ([a], [b]) => Number(a) - Number(b)
      )

      for (const [minQuantity, discount] of sortedBundles) {
        if (cartQuantity >= Number(minQuantity)) {
          bundle = {
            minQuantity: Number(minQuantity),
            discount: Number(discount)
          }
        }
      }

      if (bundle) {
        itemsPrice = price * cartQuantity * (1 - bundle.discount / 100)
      }
    } else {
      itemsPrice = price * cartQuantity
    }

    const itemsWeight = weight * cartQuantity

    const lineItem = {
      currency: 'USD',
      manufacture_country: 'CA',
      // date 2 weeks from now that item needs to be delivered by
      max_delivery_time: new Date(Date.now() + 12096e5).toISOString(),
      // date 1 week from now that item needs to be shipped by
      max_ship_time: new Date(Date.now() + 6048e5).toISOString(),
      quantity: cartQuantity,
      sku: productId,
      title: name,
      total_price: itemsPrice.toString(),
      weight: itemsWeight.toString(),
      weight_unit: 'g',
      object_id: productId
    }

    return lineItem
  })

  // console.log('Line Items:', lineItems)

  // Calculate the total quantity, price, and weight of the cart

  const totalQuantity = cartItems.reduce((acc, cartItem) => {
    const { cartQuantity } = cartItem
    return acc + cartQuantity
  }, 0)

  const totalPrice = cartItems.reduce((acc, cartItem) => {
    const { price, cartQuantity, bundles } = cartItem

    if (bundles && cartQuantity >= 1) {
      // find the bundle that applies to the current cart item
      // console.log('Bundles:', Object.entries(bundles))

      let bundle = null
      for (const [minQuantity, discount] of Object.entries(bundles)) {
        if (cartQuantity >= Number(minQuantity)) {
          bundle = {
            minQuantity: Number(minQuantity),
            discount: Number(discount)
          }
        }
      }

      if (bundle) {
        return acc + price * totalQuantity * (1 - bundle.discount / 100)
      }
    }

    return acc + price * totalQuantity
  }, 0)

  const totalWeight = cartItems.reduce((acc, cartItem) => {
    const { weight, cartQuantity } = cartItem

    return acc + weight * cartQuantity
  }, 0)

  // Get the parcel template from shippo
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

  // Create the customs declaration object
  const customsDeclaration = {
    certify: true,
    certify_signer: 'PocketCaps',
    contents_explanation: 'Keyboard Keycaps',
    contents_type: 'MERCHANDISE',
    eel_pfc: 'NOEEI_30_36',
    incoterm: 'DDP',
    is_vat_collected: null,
    items: [
      {
        description: 'Keyboard Keycaps',
        mass_unit: 'g',
        // "metadata": "Order ID \"123454\"",
        net_weight: totalWeight.toString(),
        origin_country: 'CA',
        quantity: totalQuantity,
        tarrif_number: '3926.90',
        value_amount: totalPrice.toString(),
        value_currency: 'USD'
      }
    ],
    non_delivery_option: 'RETURN',
    address_importer: {
      // todo: get address from db
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
    customs_declaration: customsDeclaration,
    line_items: lineItems
  }

  console.log('Shipment Object:', JSON.stringify(shipmentObject))

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
