import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

export type ApiCustomer = {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
}

function extractNameFromShippingAddress(shippingAddress: string): string {
  try {
    if (!shippingAddress) return ''
    const parsed = JSON.parse(shippingAddress)
    const firstName = parsed.firstName || ''
    const lastName = parsed.lastName || ''
    return `${firstName} ${lastName}`.trim()
  } catch {
    return ''
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: 'single-user'
      }
    })
    if (!store) {
      return new NextResponse('Unauthorized to access this store', {
        status: 403
      })
    }
    // Fetch all orders for this store
    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    // Aggregate customers by email
    const customerMap: Record<string, ApiCustomer> = {}
    for (const order of orders) {
      const email = order.emailAddress || ''
      if (!email) continue // skip orders without email
      const name = extractNameFromShippingAddress(order.shippingAddress)
      if (!customerMap[email]) {
        customerMap[email] = {
          id: email, // use email as unique id
          name: order.customerName,
          email,
          phone: order.phoneNumber,
          totalOrders: 0,
          totalSpent: 0
        }
      }
      customerMap[email].totalOrders += 1
      customerMap[email].totalSpent += (order.totalPriceInCents / 100) || 0
    }
    const customers: ApiCustomer[] = Object.values(customerMap)
    return NextResponse.json(customers)
  } catch (error) {
    console.error('[CUSTOMERS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
