import {
  calculateProductSalePrice,
  formatPriceDisplay,
  parsePriceInput,
  dollarsFromCents,
  centsToDollars,
  type SaleInfo
} from './utils'

function makeSale(overrides: Partial<SaleInfo> = {}): SaleInfo {
  return {
    id: 'sale-1',
    name: 'Test Sale',
    percentage: 10,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isActive: true,
    isStoreWide: false,
    ...overrides
  }
}

describe('calculateProductSalePrice', () => {
  it('returns no discount when there are no sales', () => {
    const result = calculateProductSalePrice(1000, [])

    expect(result).toEqual({
      originalPriceInCents: 1000,
      salePriceInCents: null,
      discountPercentage: null,
      sale: null,
      hasActiveSale: false
    })
  })

  it('applies a single sale percentage discount', () => {
    const sale = makeSale({ percentage: 20 })
    const result = calculateProductSalePrice(1000, [sale])

    expect(result.salePriceInCents).toBe(800)
    expect(result.discountPercentage).toBe(20)
    expect(result.sale).toBe(sale)
    expect(result.hasActiveSale).toBe(true)
  })

  it('picks the sale with the highest percentage when multiple apply', () => {
    const low = makeSale({ id: 'low', percentage: 10 })
    const high = makeSale({ id: 'high', percentage: 50 })
    const mid = makeSale({ id: 'mid', percentage: 30 })

    const result = calculateProductSalePrice(1000, [low, high, mid])

    expect(result.sale?.id).toBe('high')
    expect(result.salePriceInCents).toBe(500)
  })

  it('rounds the discount amount to the nearest cent', () => {
    // 999 * 33% = 329.67 -> rounds to 330
    const result = calculateProductSalePrice(999, [makeSale({ percentage: 33 })])

    expect(result.salePriceInCents).toBe(669)
  })

  it('floors the sale price at 0 for a 100% discount', () => {
    const result = calculateProductSalePrice(1000, [makeSale({ percentage: 100 })])

    expect(result.salePriceInCents).toBe(0)
  })

  it('treats a 0% sale as no discount applied (falls through to no bestSale found)', () => {
    const result = calculateProductSalePrice(1000, [makeSale({ percentage: 0 })])

    // percentage 0 never exceeds highestDiscount (starts at 0), so no sale is selected
    expect(result.hasActiveSale).toBe(false)
    expect(result.salePriceInCents).toBeNull()
  })

  it('handles a zero original price without going negative', () => {
    const result = calculateProductSalePrice(0, [makeSale({ percentage: 50 })])

    expect(result.salePriceInCents).toBe(0)
  })
})

describe('formatPriceDisplay', () => {
  it('formats whole-dollar cent amounts', () => {
    expect(formatPriceDisplay(1000)).toBe('$10.00')
  })

  it('formats sub-dollar amounts', () => {
    expect(formatPriceDisplay(5)).toBe('$0.05')
  })

  it('formats zero', () => {
    expect(formatPriceDisplay(0)).toBe('$0.00')
  })
})

describe('parsePriceInput', () => {
  it('parses a plain dollar string into cents', () => {
    expect(parsePriceInput('19.99')).toBe(1999)
  })

  it('strips currency symbols and commas', () => {
    expect(parsePriceInput('$1,234.50')).toBe(123450)
  })

  it('returns 0 for empty or non-numeric input', () => {
    expect(parsePriceInput('')).toBe(0)
    expect(parsePriceInput('abc')).toBe(0)
  })
})

describe('dollarsFromCents / centsToDollars', () => {
  it('converts cents to a numeric dollar amount', () => {
    expect(dollarsFromCents(2599)).toBe(25.99)
  })

  it('converts cents to a fixed 2-decimal dollar string', () => {
    expect(centsToDollars(2599)).toBe('25.99')
    expect(centsToDollars(100)).toBe('1.00')
  })
})
