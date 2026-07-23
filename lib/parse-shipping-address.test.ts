import { parseShippingAddress } from './parse-shipping-address'

describe('parseShippingAddress', () => {
  it('parses a well-formed flattened address string', () => {
    const result = parseShippingAddress({
      shippingAddress: '123 Main St Apt 4, Springfield, IL 62701, US',
      customerName: 'Jane Doe',
      phoneNumber: '555-1234',
      emailAddress: 'jane@example.com'
    })

    expect(result).toEqual({
      name: 'Jane Doe',
      street1: '123 Main St Apt 4',
      street2: '',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      country: 'US',
      phone: '555-1234',
      email: 'jane@example.com'
    })
  })

  it('handles a multi-word state name when the zip itself has no internal space', () => {
    const result = parseShippingAddress({
      shippingAddress: '1 Main St, New York City, New York 10001, US',
      customerName: '',
      phoneNumber: '',
      emailAddress: ''
    })

    expect(result.state).toBe('New York')
    expect(result.zip).toBe('10001')
  })

  it('recognizes a two-part Canadian postal code (with an internal space) as a single zip', () => {
    const result = parseShippingAddress({
      shippingAddress: '1 Main St, Vancouver, British Columbia V6B 1A1, CA',
      customerName: '',
      phoneNumber: '',
      emailAddress: ''
    })

    expect(result.zip).toBe('V6B 1A1')
    expect(result.state).toBe('British Columbia')
  })

  it('recognizes a single-word province with a Canadian postal code', () => {
    const result = parseShippingAddress({
      shippingAddress: '1 Main St, Toronto, Ontario M5H 2N2, CA',
      customerName: '',
      phoneNumber: '',
      emailAddress: ''
    })

    expect(result.zip).toBe('M5H 2N2')
    expect(result.state).toBe('Ontario')
  })

  it('does not misdetect a US state+zip as a Canadian postal code', () => {
    const result = parseShippingAddress({
      shippingAddress: '1 Main St, Austin, TX 78701, US',
      customerName: '',
      phoneNumber: '',
      emailAddress: ''
    })

    expect(result.zip).toBe('78701')
    expect(result.state).toBe('TX')
  })

  it('never throws on an empty or malformed address string', () => {
    const result = parseShippingAddress({
      shippingAddress: '',
      customerName: '',
      phoneNumber: '',
      emailAddress: ''
    })

    expect(result).toEqual({
      name: '',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
      email: ''
    })
  })

  it('does not throw on a string with fewer than the expected number of segments', () => {
    const result = parseShippingAddress({
      shippingAddress: 'just one segment',
      customerName: 'Jane',
      phoneNumber: '',
      emailAddress: ''
    })

    expect(result.street1).toBe('just one segment')
    expect(result.city).toBe('')
  })
})
