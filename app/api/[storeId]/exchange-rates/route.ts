import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { ExchangeRate } from '@prisma/client'

interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: Record<string, number>
}

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const defaultExchangeRates: Record<string, number> = {
  USD: 1,
  CAD: 1.38,
  AUD: 1.5
}

const fetchExchangeRates = async (
  baseCurrency: string = 'USD'
): Promise<Record<string, number>> => {
  let existingRate: ExchangeRate | null = null
  try {
    // Check if we have a recent entry in the database (less than 24 hours old)
    existingRate = await prismadb.exchangeRate.findUnique({
      where: {
        baseCurrency
      }
    })

    const currentTime = new Date()

    // If we have valid cached data that's less than 24 hours old, use it
    if (existingRate) {
      const rateAge = currentTime.getTime() - existingRate.updatedAt.getTime()

      if (!IS_PRODUCTION || rateAge < CACHE_DURATION_MS) {
        console.log(
          'Using cached exchange rates from database for:',
          baseCurrency
        )
        return existingRate.rates as Record<string, number>
      }
    }

    // Otherwise fetch fresh data from the API
    console.log('Fetching exchange rates for:', baseCurrency)
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`
    )
    // console.log('Exchange API Response status:', response.status)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()
    // console.log('Exchange rates:', data.conversion_rates)

    // Store in database (upsert to create or update)
    await prismadb.exchangeRate.upsert({
      where: {
        baseCurrency
      },
      update: {
        rates: data.conversion_rates,
        updatedAt: currentTime
      },
      create: {
        baseCurrency,
        rates: data.conversion_rates
      }
    })

    return data.conversion_rates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return defaultExchangeRates // Fallback to static rates
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const baseCurrency = searchParams.get('base') || 'USD'

    const exchangeRates = await fetchExchangeRates(baseCurrency)

    // Get database entry for metadata
    const dbEntry = await prismadb.exchangeRate.findUnique({
      where: {
        baseCurrency
      }
    })

    const cacheAge = dbEntry
      ? Math.floor((Date.now() - dbEntry.updatedAt.getTime()) / 1000 / 60)
      : 0 // in minutes

    return NextResponse.json({
      success: true,
      rates: exchangeRates,
      base: baseCurrency,
      timestamp: Date.now(),
      cached: !!dbEntry,
      cacheAge: cacheAge,
      nextUpdate: dbEntry
        ? new Date(
            dbEntry.updatedAt.getTime() + CACHE_DURATION_MS
          ).toISOString()
        : null
    })
  } catch (error) {
    console.error('Error in exchange rate API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get exchange rates' },
      { status: 500 }
    )
  }
}
