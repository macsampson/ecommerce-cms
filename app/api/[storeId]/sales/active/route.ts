import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const now = new Date()

    const activeSales = await prismadb.sale.findMany({
      where: {
        storeId: params.storeId,
        isActive: true,
        startDate: {
          lte: now
        },
        endDate: {
          gte: now
        }
      },
      include: {
        products: {
          select: {
            productId: true
          }
        }
      },
      orderBy: {
        percentage: 'desc' // Get best discounts first
      }
    })

    return NextResponse.json(activeSales)
  } catch (error) {
    logger.info('[ACTIVE_SALES_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}