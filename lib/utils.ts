import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// const to convert currnecy to USD
export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export const formatPriceDisplay = (priceInCents: number) => {
  return `$${(priceInCents / 100).toFixed(2)}`
}

export const parsePriceInput = (value: string) => {
  const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''))
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) // Convert to cents
}

export const dollarsFromCents = (cents: number) => {
  return cents / 100
}

export const centsToDollars = (cents: number) => {
  return (cents / 100).toFixed(2)
}

export interface SaleInfo {
  id: string
  name: string
  percentage: number
  startDate: Date
  endDate: Date
  isActive: boolean
  isStoreWide: boolean
}

export interface ProductSaleInfo {
  originalPriceInCents: number
  salePriceInCents: number | null
  discountPercentage: number | null
  sale: SaleInfo | null
  hasActiveSale: boolean
}

export const calculateProductSalePrice = (
  originalPriceInCents: number,
  sales: SaleInfo[]
): ProductSaleInfo => {
  if (sales.length === 0) {
    return {
      originalPriceInCents,
      salePriceInCents: null,
      discountPercentage: null,
      sale: null,
      hasActiveSale: false
    }
  }

  // Find the sale with the highest discount percentage
  let bestSale: SaleInfo | null = null
  let highestDiscount = 0

  for (const sale of sales) {
    if (sale.percentage > highestDiscount) {
      highestDiscount = sale.percentage
      bestSale = sale
    }
  }

  if (!bestSale) {
    return {
      originalPriceInCents,
      salePriceInCents: null,
      discountPercentage: null,
      sale: null,
      hasActiveSale: false
    }
  }

  const discountAmount = Math.round((originalPriceInCents * bestSale.percentage) / 100)
  const salePriceInCents = originalPriceInCents - discountAmount

  return {
    originalPriceInCents,
    salePriceInCents: Math.max(0, salePriceInCents), // Ensure price doesn't go negative
    discountPercentage: bestSale.percentage,
    sale: bestSale,
    hasActiveSale: true
  }
}
