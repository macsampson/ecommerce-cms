export type ParsedAddress = {
  name: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
}

type OrderAddressFields = {
  shippingAddress: string
  customerName: string
  phoneNumber: string
  emailAddress: string
}

/**
 * Order.shippingAddress is stored as a flattened string, built at checkout
 * time (see app/api/webhook/route.ts) as:
 *   "<street> <apartment>, <city>, <state> <zip>, <country>"
 * There's no structured data to recover it from, so this is a best-effort
 * reverse-parse meant to prefill an editable form — never trust it as-is.
 * Never throws; unparseable segments fall back to ''.
 */
export function parseShippingAddress(
  order: OrderAddressFields
): ParsedAddress {
  const segments = (order.shippingAddress || '')
    .split(',')
    .map((segment) => segment.trim())

  const [street1 = '', city = '', stateZip = '', country = ''] = segments

  let state = ''
  let zip = ''
  const stateZipParts = stateZip.split(/\s+/).filter(Boolean)
  if (stateZipParts.length > 0) {
    zip = stateZipParts[stateZipParts.length - 1]
    state = stateZipParts.slice(0, -1).join(' ')
  }

  return {
    name: order.customerName || '',
    street1,
    street2: '',
    city,
    state,
    zip,
    country,
    phone: order.phoneNumber || '',
    email: order.emailAddress || ''
  }
}
