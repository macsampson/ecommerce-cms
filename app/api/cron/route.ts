// pages/api/check-orders.ts
import { NextApiResponse } from 'next'
import prismadb from '@/lib/prismadb'

// This cron job checks for unpaid orders made in the last hour and reincrements the product quantities
export async function POST(res: NextApiResponse) {
  try {
    // Query for unpaid orders made in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const orders = await prismadb.order.findMany({
      where: {
        isPaid: false,
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

    // Reincrement product quantities
    for (const order of orders) {
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

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error checking and releasing reserved inventory:', error)
    res
      .status(500)
      .json({ error: 'Failed to check and release reserved inventory' })
  }
}
