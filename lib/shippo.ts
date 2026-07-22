export type ShippoAddress = {
  name: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
  is_residential?: boolean
}

export type ShippoParcel = {
  length: string
  width: string
  height: string
  distance_unit: string
  weight: string
  weight_unit: string
  mass_unit: string
}

export type ShippoLineItem = {
  title: string
  sku?: string
  quantity: number
  total_price: string
  currency: string
  weight: string
  weight_unit: string
  mass_unit: string
  manufacture_country?: string
}

export type ShippoRate = {
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

export type ShippoMessage = {
  source?: string
  code?: string
  text: string
}

export type ShippoShipmentResponse = {
  rates: ShippoRate[]
  messages: ShippoMessage[]
  status?: string
  httpOk: boolean
  raw: unknown
}

/**
 * Shippo's validation errors (e.g. an incomplete address_from) aren't
 * shaped like `{ messages: [...] }` — they come back as
 * `{ field: [{ subfield: ["some error"] }] }` with a non-2xx status.
 * Flattens whatever shape shows up into a readable string so it can be
 * surfaced to the admin instead of a generic "no rates" message.
 */
export function flattenShippoError(raw: unknown): string {
  const messages: string[] = []

  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      messages.push(path ? `${path}: ${value}` : value)
    } else if (Array.isArray(value)) {
      value.forEach((item) => walk(item, path))
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, v]) =>
        walk(v, path ? `${path}.${key}` : key)
      )
    }
  }

  walk(raw, '')
  return messages.join('; ')
}

export type ShippoTransaction = {
  object_id: string
  status: string
  label_url: string | null
  tracking_number: string | null
  tracking_url_provider: string | null
  rate: string
  messages: ShippoMessage[]
}

/**
 * Creates a Shippo shipment (address pair + parcel) and returns the
 * available rates. Shared by the storefront cart-rates route and the
 * admin order-label routes so both hit the same Shippo call shape.
 */
export async function createShippoShipment(params: {
  apiKey: string
  addressFrom: ShippoAddress
  addressTo: ShippoAddress
  parcel: ShippoParcel
  lineItems?: ShippoLineItem[]
  customsDeclaration?: unknown
}): Promise<ShippoShipmentResponse> {
  const response = await fetch('https://api.goshippo.com/shipments/', {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${params.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      address_from: params.addressFrom,
      address_to: params.addressTo,
      parcels: [params.parcel],
      async: false,
      customs_declaration: params.customsDeclaration,
      line_items: params.lineItems
    })
  })

  const data = await response.json()

  return {
    rates: data.rates || [],
    messages: data.messages || [],
    status: data.status,
    httpOk: response.ok,
    raw: data
  }
}

/**
 * Purchases a label for a previously-fetched rate. Synchronous
 * (async: false) — Shippo returns SUCCESS/ERROR directly, no polling.
 */
export async function purchaseShippoLabel(params: {
  apiKey: string
  rate: string
}): Promise<ShippoTransaction> {
  const response = await fetch('https://api.goshippo.com/transactions', {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${params.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rate: params.rate,
      label_file_type: 'PDF',
      async: false
    })
  })

  return response.json()
}
