import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { getGraphRevenue } from '@/actions/get-graph-revenue'

interface GraphData {
  name: string
  total: number
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params
  const { searchParams } = new URL(req.url)
  const yearParam = searchParams.get('year')
  const year = yearParam ? parseInt(yearParam, 10) : undefined

  if (!storeId || !year || isNaN(year)) {
    return NextResponse.json(
      { error: 'Missing or invalid storeId or year' },
      { status: 400 }
    )
  }

  try {
    const data = await getGraphRevenue(storeId, year)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch graph revenue' },
      { status: 500 }
    )
  }
}
