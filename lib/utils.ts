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

export const formatPriceDisplay = (price: number) => {
  return `$${price.toFixed(2)}`
}

export const parsePriceInput = (input: string) => {
  return parseFloat(input.replace(/[^0-9.-]+/g, ''))
}
