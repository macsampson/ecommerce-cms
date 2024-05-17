// pages/api/check-orders.ts
import { NextRequest, NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'

// This cron job checks for unpaid orders made in the last hour and reincrements the product quantities
export async function POST(req: NextRequest) {
  try {
    // Query for unpaid orders made in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const orders = await prismadb.order.findMany({
      where: {
        isPaid: false,
        isAbandoned: false,
        createdAt: {
          gte: oneHourAgo,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    // Reincrement product quantities and mark orders as abandoned
    for (const order of orders) {
      // Mark the order as abandoned
      await prismadb.order.update({
        where: { id: order.id },
        data: { isAbandoned: true },
      })

      for (const item of order.orderItems) {
        await prismadb.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        })
      }
    }

    return NextResponse.json(
      {
        message: 'Checked and released reserved inventory',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking and releasing reserved inventory:', error)
    return NextResponse.json(
      { error: 'Error checking and releasing reserved inventory' },
      { status: 500 }
    )
  }
}
