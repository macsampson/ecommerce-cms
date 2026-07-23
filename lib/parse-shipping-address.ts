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

// Canadian postal codes ("V6B 1A1") are conventionally written as two
// space-separated halves, each alternating letter/digit/letter and
// digit/letter/digit — indistinguishable from a zip by "last token" alone,
// so it's checked for explicitly before falling back to the single-token case.
const CANADIAN_POSTAL_FIRST_HALF = /^[A-Za-z]\d[A-Za-z]$/
const CANADIAN_POSTAL_SECOND_HALF = /^\d[A-Za-z]\d$/

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
  if (stateZipParts.length >= 2) {
    const last = stateZipParts[stateZipParts.length - 1]
    const secondLast = stateZipParts[stateZipParts.length - 2]

    if (
      CANADIAN_POSTAL_FIRST_HALF.test(secondLast) &&
      CANADIAN_POSTAL_SECOND_HALF.test(last)
    ) {
      zip = `${secondLast} ${last}`
      state = stateZipParts.slice(0, -2).join(' ')
    } else {
      zip = last
      state = stateZipParts.slice(0, -1).join(' ')
    }
  } else if (stateZipParts.length === 1) {
    zip = stateZipParts[0]
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
