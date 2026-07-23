import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { getGraphRevenue } from '@/actions/get-graph-revenue'

export async function GET(req: NextRequest, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const { storeId } = params
  const { searchParams } = new URL(req.url)
  const yearParam = searchParams.get('year')
  const year = yearParam ? parseInt(yearParam, 10) : undefined

  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  if (!storeId || !year || isNaN(year)) {
    return NextResponse.json(
      { error: 'Missing or invalid storeId or year' },
      { status: 400 }
    )
  }

  const store = await prismadb.store.findFirst({
    where: { id: storeId, userId: 'single-user' }
  })

  if (!store) {
    return NextResponse.json(
      { error: 'Unauthorized to access this store' },
      { status: 403 }
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
