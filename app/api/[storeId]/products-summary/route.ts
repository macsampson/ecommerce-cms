import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { formatter } from '@/lib/utils' // Assuming this is accessible

// This should match or be compatible with ProductColumn in the frontend
export type ApiProductSummary = {
  id: string
  name: string
  price: string // Formatted price
  quantity: number
  category: string
  size?: string // Optional
  color?: string // Optional, hex value like #RRGGBB
  isFeatured: boolean
  isArchived: boolean
  createdAt: string // Formatted date
  updatedAt: string // Formatted date
  imageUrl?: string | null
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })

    if (!store) {
      return new NextResponse('Unauthorized to access this store', {
        status: 403
      })
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        category: true, // For category.name
        size: true, // For size.name
        color: true, // For color.value (hex)
        images: true // Include images for preview
      },
      orderBy: {
        // Replicating order from app/(dashboard)/[storeId]/(routes)/products/page.tsx
        // That page used `quantity: 'desc'` in its initial fetch for `products`.
        // However, the `ProductClient` itself is what renders `DataTable` which handles its own sorting.
        // For an API, usually, we'd either not sort by default, sort by `createdAt: 'desc'`,
        // or allow sort params.
        // The original page used `quantity: 'desc'`. Let's use `createdAt: 'desc'` as a more general default for an API.
        // The client-side DataTable will handle user-defined sorting anyway.
        createdAt: 'desc'
      }
    })

    const formattedProducts: ApiProductSummary[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      isFeatured: product.isFeatured,
      isArchived: product.isArchived,
      price: product.price ? formatter.format(product.price.toNumber()) : 'N/A',
      quantity: product.quantity,
      category: product.category?.name || 'N/A', // category should exist due to schema
      size: product.size?.name, // Optional, so can be undefined
      color: product.color?.value, // Optional, color.value is the hex string
      createdAt: product.createdAt
        ? format(product.createdAt, 'MMMM do, yyyy')
        : 'N/A',
      updatedAt: product.updatedAt
        ? format(product.updatedAt, 'MMMM do, yyyy')
        : 'N/A',
      imageUrl:
        product.images && product.images.length > 0
          ? product.images[0].url
          : null
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('[PRODUCTS_SUMMARY_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
