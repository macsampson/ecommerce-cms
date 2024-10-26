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

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({})
}

// Handle POST request for shipping rate calculation
export async function POST(req: Request) {
  // Extract address, cart items, and currency from the request body
  const {
    address,
    cartItems,
    currency
  }: { address: AddressType; cartItems: CartItemType[]; currency: string } =
    await req.json()

  console.log('currency: ', currency)
  // Create line items for Shippo from cart items
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

    // Calculate the price of the item based on quantity and any applicable bundles
    let itemsPrice = 0
    if (bundles && cartQuantity > 1) {
      let bundle = null
      // Sort bundles by key and find the largest minQuantity that is less than or equal to the cartQuantity
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

    // Create a line item object for Shippo
    const lineItem = {
      currency: currency,
      manufacture_country: 'CA',
      max_delivery_time: new Date(Date.now() + 12096e5).toISOString(), // 2 weeks from now
      max_ship_time: new Date(Date.now() + 6048e5).toISOString(), // 1 week from now
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

  // Calculate the total quantity, price, and weight of the cart
  const totalQuantity = cartItems.reduce((acc, cartItem) => {
    const { cartQuantity } = cartItem
    return acc + cartQuantity
  }, 0)

  const totalPrice = cartItems.reduce((acc, cartItem) => {
    const { price, cartQuantity, bundles } = cartItem

    if (bundles && cartQuantity >= 1) {
      // Find the bundle that applies to the current cart item
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

  // Fetch the parcel template from Shippo
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

  // Create the customs declaration object for international shipping
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
      // TODO: Fetch this address from the database
      name: 'Mackenzie Sampson',
      company: 'PocketCaps',
      street1: '6381 Weir Rd',
      street2: '',
      city: 'Kamloops',
      state: 'BC',
      zip: 'V0E2A0',
      country: 'CA',
      phone: '+17788289009',
      email: 'pocketcaps@gmail.com',
      is_residential: true
    }
  } as CreateCustomsDeclarationRequest

  // Create the shipment object for Shippo API request
  const shipmentObject = {
    address_from: addressFromCanada,
    address_to: {
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

  // Send request to Shippo API to get live rates
  try {
    const data = await fetch('https://api.goshippo.com/live-rates', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shipmentObject)
    }).then((res) => res.json())

    // Return the shipping rates to the client
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Server Error', {
      status: 500
    })
  }
}
