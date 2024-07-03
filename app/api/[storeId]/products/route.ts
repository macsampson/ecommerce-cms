import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { useParams } from 'next/navigation'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const {
      name,
      price,
      quantity,
      description,
      variations,
      categoryId,
      colorId,
      sizeId,
      images,
      bundles,
      isArchived,
      isFeatured
    } = body

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if (!name) return new NextResponse('Name is required', { status: 400 })

    if (!images || !images.length) {
      return new NextResponse('At least one image is required', { status: 400 })
    }

    if (!price) return new NextResponse('Price ID is required', { status: 400 })

    if (!categoryId)
      return new NextResponse('Category ID  is required', { status: 400 })

    // if (!colorId)
    //   return new NextResponse("Color ID is required", { status: 400 })

    // if (!sizeId) return new NextResponse("Size ID is required", { status: 400 })

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: userId
      }
    })

    if (!storeWithUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        quantity,
        description,
        variations: {
          createMany: {
            data: [
              ...variations.map(
                (variation: { name: string; price: number }) => variation
              )
            ]
          }
        },
        categoryId,
        colorId,
        sizeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)]
          }
        },
        isArchived,
        isFeatured,
        storeId: params.storeId
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCTS_POST]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

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

    console.log('searchParams: ', searchParams)

    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

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
        bundles: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (amountToFetch) {
      return NextResponse.json(products.slice(0, Number(amountToFetch)))
    }

    return NextResponse.json(products)
  } catch (error) {
    console.log('[PRODUCTS_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
