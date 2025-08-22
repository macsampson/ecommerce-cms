import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; saleId: string } }
) {
  try {
    if (!params.saleId) {
      return new NextResponse('Sale ID is required', { status: 400 })
    }

    const sale = await prismadb.sale.findUnique({
      where: {
        id: params.saleId,
        storeId: params.storeId,
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.log('[SALE_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; saleId: string } }
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

    if (!params.saleId) {
      return new NextResponse('Sale ID is required', { status: 400 })
    }

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

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return new NextResponse('Percentage must be between 0 and 100', { status: 400 })
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return new NextResponse('Start date must be before end date', { status: 400 })
    }

    if (!isStoreWide && productIds && productIds.length === 0) {
      return new NextResponse('Product IDs are required for non-store-wide sales', { status: 400 })
    }

    // Check for overlapping sales (excluding current sale)
    if (startDate && endDate) {
      const overlappingSales = await prismadb.sale.findMany({
        where: {
          storeId: params.storeId,
          isActive: true,
          id: {
            not: params.saleId // Exclude the current sale being updated
          },
          OR: [
            {
              // Updated sale starts during existing sale
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } }
              ]
            },
            {
              // Updated sale ends during existing sale
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            },
            {
              // Updated sale completely contains existing sale
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
      } else if (productIds) {
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
    }

    // First, update the sale
    const sale = await prismadb.sale.update({
      where: {
        id: params.saleId,
        storeId: params.storeId,
      },
      data: {
        name,
        description,
        percentage,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        isStoreWide,
      }
    })

    // If productIds are provided, update the product associations
    if (productIds !== undefined) {
      // Delete existing product associations
      await prismadb.saleProduct.deleteMany({
        where: {
          saleId: params.saleId
        }
      })

      // Create new product associations if not store-wide
      if (!isStoreWide && productIds.length > 0) {
        await prismadb.saleProduct.createMany({
          data: productIds.map((productId: string) => ({
            saleId: params.saleId,
            productId
          }))
        })
      }
    }

    // Fetch and return the updated sale with products
    const updatedSale = await prismadb.sale.findUnique({
      where: {
        id: params.saleId
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedSale)
  } catch (error) {
    console.log('[SALE_PATCH]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; saleId: string } }
) {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) return new NextResponse('Unauthenticated', { status: 401 })

    if (!params.saleId) {
      return new NextResponse('Sale ID is required', { status: 400 })
    }

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

    const sale = await prismadb.sale.delete({
      where: {
        id: params.saleId,
        storeId: params.storeId,
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.log('[SALE_DELETE]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}