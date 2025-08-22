import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const {
      name,
      description,
      percentage,
      startDate,
      endDate,
      isActive,
      isStoreWide,
      productIds
    } = body

    if (!authenticated) return new NextResponse('Unauthenticated', { status: 401 })

    if (!name) return new NextResponse('Name is required', { status: 400 })
    if (!percentage) return new NextResponse('Percentage is required', { status: 400 })
    if (!startDate) return new NextResponse('Start date is required', { status: 400 })
    if (!endDate) return new NextResponse('End date is required', { status: 400 })

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user"
      }
    })

    if (!storeWithUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    if (percentage < 0 || percentage > 100) {
      return new NextResponse('Percentage must be between 0 and 100', { status: 400 })
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return new NextResponse('Start date must be before end date', { status: 400 })
    }

    if (!isStoreWide && (!productIds || productIds.length === 0)) {
      return new NextResponse('Product IDs are required for non-store-wide sales', { status: 400 })
    }

    // Check for overlapping sales
    const overlappingSales = await prismadb.sale.findMany({
      where: {
        storeId: params.storeId,
        isActive: true,
        OR: [
          {
            // New sale starts during existing sale
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } }
            ]
          },
          {
            // New sale ends during existing sale
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } }
            ]
          },
          {
            // New sale completely contains existing sale
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } }
            ]
          }
        ]
      },
      include: {
        products: {
          select: {
            productId: true
          }
        }
      }
    })

    // Check for conflicts
    if (isStoreWide) {
      // Store-wide sales conflict with any other active sale
      if (overlappingSales.length > 0) {
        return new NextResponse('Store-wide sale conflicts with existing active sales', { status: 400 })
      }
    } else {
      // Product-specific sales conflict with store-wide sales or overlapping product sales
      for (const existingSale of overlappingSales) {
        if (existingSale.isStoreWide) {
          return new NextResponse('Cannot create product-specific sale during active store-wide sale', { status: 400 })
        }
        
        // Check for product overlap
        const existingProductIds = existingSale.products.map(p => p.productId)
        const hasOverlap = productIds.some((id: string) => existingProductIds.includes(id))
        if (hasOverlap) {
          return new NextResponse('Some products are already in an active sale', { status: 400 })
        }
      }
    }

    const sale = await prismadb.sale.create({
      data: {
        name,
        description,
        percentage,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        isStoreWide,
        storeId: params.storeId,
        products: isStoreWide ? undefined : {
          createMany: {
            data: productIds.map((productId: string) => ({ productId }))
          }
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.log('[SALES_POST]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const sales = await prismadb.sale.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.log('[SALES_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}