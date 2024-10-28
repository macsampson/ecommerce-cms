import { NextResponse } from 'next/server'
import axios from 'axios'

type Address = {
  firstName: string
  lastName: string
  apartment?: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

type ValidationResponse = {
  isValid: boolean
  suggestedAddress?: {
    name: string
    street: string
    apartment?: string
    city: string
    state: string
    zip: string
    country: string
  }
  validationDetails?: {
    score: string
    code: string
    description: string
  }
}

const validateAddress = async (
  address: Address
): Promise<ValidationResponse> => {
  try {
    const response = await axios.get(
      'https://api.goshippo.com/v2/addresses/validate',
      {
        params: {
          name: address.firstName + ' ' + address.lastName,
          address_line_1: address.street,
          address_line_2: address.apartment,
          city_locality: address.city,
          state_province: address.state,
          postal_code: address.zip,
          country_code: address.country
        },
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`
        }
      }
    )

    const validationResult = response.data.analysis.validation_result.value
    const isValid = validationResult === 'valid'

    // Return suggested address if available
    if (response.data.recommended_address) {
      return {
        isValid,
        suggestedAddress: {
          name: response.data.recommended_address.name,
          street: response.data.recommended_address.address_line_1,
          apartment: response.data.recommended_address.address_line_2,
          city: response.data.recommended_address.city_locality,
          state: response.data.recommended_address.state_province,
          zip: response.data.recommended_address.postal_code,
          country: response.data.recommended_address.country_code
        },
        validationDetails: response.data.recommended_address.confidence_result
      }
    }

    return { isValid }
  } catch (error) {
    console.error('Address validation error:', error)
    return { isValid: false }
  }
}

export async function OPTIONS() {
  return NextResponse.json({})
}

export async function POST(req: Request) {
  try {
    const address: Address = await req.json()
    const validationResponse = await validateAddress(address)

    return NextResponse.json(validationResponse)
  } catch (error) {
    console.error('Error validating address:', error)
    return new NextResponse('Error validating address', { status: 500 })
  }
}
