// API cron job that handles scheduled tasks
import { NextRequest, NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'

// This cron job handles:
// 1. Checks for unpaid orders made in the last hour and reincrements the product quantities
// 2. Activates/deactivates sales based on their scheduled start/end dates
// TODO: implement a solution to clear by store id - currently all stores in the database are checked?
export async function POST(req: NextRequest) {
  return executeCronJob(req)
}

export async function GET(req: NextRequest) {
  return executeCronJob(req)
}

async function executeCronJob(req: NextRequest) {
  try {
    // 1. Handle abandoned order cleanup
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const orders = await prismadb.order.findMany({
      where: {
        isPaid: false,
        isAbandoned: false,
        createdAt: {
          lt: oneHourAgo,
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

    // 2. Handle sales scheduling
    const now = new Date()
    
    // Activate sales that should be active now but aren't
    const salesToActivate = await prismadb.sale.findMany({
      where: {
        isActive: false,
        startDate: {
          lte: now
        },
        endDate: {
          gte: now
        }
      }
    })

    for (const sale of salesToActivate) {
      await prismadb.sale.update({
        where: { id: sale.id },
        data: { isActive: true }
      })
      console.log(`Activated sale: ${sale.name}`)
    }

    // Deactivate sales that have ended
    const salesToDeactivate = await prismadb.sale.findMany({
      where: {
        isActive: true,
        endDate: {
          lt: now
        }
      }
    })

    for (const sale of salesToDeactivate) {
      await prismadb.sale.update({
        where: { id: sale.id },
        data: { isActive: false }
      })
      console.log(`Deactivated sale: ${sale.name}`)
    }

    const messages = []
    if (orders.length === 0) {
      console.log('No abandoned orders found')
      messages.push('No abandoned orders found')
    } else {
      console.log(`Released inventory for ${orders.length} abandoned orders`)
      messages.push(`Released inventory for ${orders.length} abandoned orders`)
    }

    if (salesToActivate.length > 0) {
      messages.push(`Activated ${salesToActivate.length} sales`)
    }
    if (salesToDeactivate.length > 0) {
      messages.push(`Deactivated ${salesToDeactivate.length} sales`)
    }

    return NextResponse.json(
      {
        message: messages.join(', ') || 'Cron job completed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Error in cron job execution' },
      { status: 500 }
    )
  }
}
