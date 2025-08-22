import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { calculateProductSalePrice, SaleInfo } from '@/lib/utils'

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured')
    const amountToFetch = searchParams.get('amountToFetch') || undefined
    const excludeProductId = searchParams.get('excludeProductId') || undefined

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    // Get products
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        id: excludeProductId ? { not: excludeProductId } : undefined
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
        variations: true,
        bundles: true,
        saleProducts: {
          include: {
            sale: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get active sales
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
      }
    })

    // Calculate sale prices for each product
    const productsWithSales = products.map(product => {
      // Check if product is in any specific sales
      const productSpecificSales = activeSales.filter(sale => 
        !sale.isStoreWide && sale.products.some(sp => sp.productId === product.id)
      )
      
      // Get store-wide sales
      const storeWideSales = activeSales.filter(sale => sale.isStoreWide)
      
      // Combine all applicable sales
      const applicableSales = [...productSpecificSales, ...storeWideSales]
      
      const saleInfo = calculateProductSalePrice(
        product.priceInCents,
        applicableSales.map(sale => ({
          id: sale.id,
          name: sale.name,
          percentage: sale.percentage,
          startDate: sale.startDate,
          endDate: sale.endDate,
          isActive: sale.isActive,
          isStoreWide: sale.isStoreWide
        }))
      )

      return {
        ...product,
        saleInfo
      }
    })

    if (amountToFetch) {
      return NextResponse.json(productsWithSales.slice(0, Number(amountToFetch)))
    }

    return NextResponse.json(productsWithSales)
  } catch (error) {
    console.log('[PRODUCTS_WITH_SALES_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}