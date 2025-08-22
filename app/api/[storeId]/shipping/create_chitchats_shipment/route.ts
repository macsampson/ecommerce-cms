import { NextRequest, NextResponse } from 'next/server'

// Define types for the request body, mirroring what you'd send from the frontend
// These should align with the types used in your main shipping route (AddressType, CartItemType)
interface AddressType {
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

interface CartItemType {
  productId: string
  name: string
  price: number
  cartQuantity: number
  weight: number
  // Add other relevant fields if needed for line_items
}

interface CreateChitChatsShipmentRequestBody {
  address: AddressType
  cartItems: CartItemType[]
  currency: string
  totalPrice: number
  totalWeight: number
  selectedPostageType: string // e.g., "chit_chats_us_edge"
  // You might also need package dimensions if they aren't fixed
  packageDimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const {
      address,
      cartItems,
      currency,
      totalPrice,
      totalWeight,
      selectedPostageType,
      packageDimensions = { length: 23, width: 16, height: 5, unit: 'cm' } // Default dimensions
    }: CreateChitChatsShipmentRequestBody = await req.json()

    if (
      !address ||
      !cartItems ||
      !cartItems.length ||
      !currency ||
      totalPrice == null || // Check for null or undefined
      totalWeight == null || // Check for null or undefined
      !selectedPostageType
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipment details' },
        { status: 400 }
      )
    }

    const CHITCHATS_API_URL = process.env.CHITCHATS_API_URL
    const CHITCHATS_CLIENT_ID = process.env.CHITCHATS_CLIENT_ID
    const CHITCHATS_API_KEY = process.env.CHITCHATS_API_KEY

    if (!CHITCHATS_API_URL || !CHITCHATS_CLIENT_ID || !CHITCHATS_API_KEY) {
      console.error('Chit Chats API environment variables are not set')
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error for Chit Chats API'
        },
        { status: 500 }
      )
    }

    const chitChatsShipmentPayload = {
      name: `${address.firstName} ${address.lastName}`,
      address_1: address.street,
      city: address.city,
      province_code: address.state,
      postal_code: address.zip,
      country_code: address.country,
      phone: address.phone || '',
      email: address.email,
      package_contents: 'merchandise',
      description: cartItems
        .map((item) => `${item.cartQuantity}x Keycaps`) // TODO: use item category
        .join(', '),
      value: totalPrice.toFixed(2),
      value_currency: currency.toUpperCase(),
      package_type: 'thick_envelope', // Or determine more dynamically if needed, e.g. 'thick_envelope'
      postage_type: selectedPostageType, // Use the selected postage type
      size_unit: packageDimensions.unit,
      size_x: packageDimensions.length,
      size_y: packageDimensions.width,
      size_z: packageDimensions.height,
      weight_unit: 'g', // Assuming weight is in grams
      weight: totalWeight,
      insurance_requested: true, // Or make this configurable
      ship_date: 'today', // Or allow selection
      line_items: cartItems.map((item) => ({
        quantity: item.cartQuantity,
        description: item.name,
        value_amount: (item.price).toFixed(2),
        currency_code: currency.toUpperCase(),
        weight: item.weight.toString(), // Weight per line item
        weight_unit: 'g',
        origin_country: 'CA', // Assuming origin is Canada
        hs_tariff_code: '3926.90' // Example HS code, make this configurable if items vary
      }))
    }

    const response = await fetch(
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

    const responseData = await response.json()

    if (!response.ok || responseData.error) {
      console.error(
        'Chit Chats Create Shipment Error:',
        responseData.error || response.statusText
      )
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create Chit Chats shipment: ${
            responseData.error?.message || response.statusText
          }`
        },
        { status: response.status }
      )
    }

    // The responseData.shipment object will contain the created shipment details,
    // including its ID (responseData.shipment.id) and status (e.g., "unpaid").
    // The frontend should store this ID to later purchase the label.
    return NextResponse.json({
      success: true,
      shipment: responseData.shipment
    })
  } catch (error: any) {
    console.error('Create Chit Chats Shipment Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Chit Chats shipment'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({})
}
