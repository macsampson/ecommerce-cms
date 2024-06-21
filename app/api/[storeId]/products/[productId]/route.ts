import ProductsPage from '@/app/(dashboard)/[storeId]/(routes)/products/page'
import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import { Decimal } from '@prisma/client/runtime/library'
import axios from 'axios'

// Function to format prices to 2 decimal places
function formatPrice(price: Decimal): string {
  return price.toFixed(2) // Ensures 2 decimal places
}

const REVALIDATE_URL = process.env.FRONTEND_STORE_URL + '/api/revalidate'

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
        variations: true,
        bundles: true
      }
    })

    if (product) {
      return NextResponse.json({
        ...product,
        price: formatPrice(product.price)
      })
    }

    // console.log(product)

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const {
      name,
      images,
      quantity,
      description,
      categoryId,
      colorId,
      sizeId,
      price,
      variations,
      bundles,
      isFeatured,
      isArchived
    } = body

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if (!name) return new NextResponse('Name is required', { status: 400 })

    if (!images || !images.length) {
      return new NextResponse('At least one image is required', { status: 400 })
    }

    if (!price) return new NextResponse('Price ID is required', { status: 400 })

    if (!categoryId)
      return new NextResponse('Category ID  is required', { status: 400 })

    // if (!quantity)
    //   return new NextResponse("Quantity  is required", { status: 400 })

    // if (!colorId)
    //   return new NextResponse("Color ID is required", { status: 400 })

    // if (!sizeId) return new NextResponse("Size ID is required", { status: 400 })

    if (!params.productId)
      return new NextResponse('Product ID is required', { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: userId
      }
    })

    if (!storeWithUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        quantity,
        description,
        variations: {
          deleteMany: {}
        },
        bundles: {
          deleteMany: {}
        },
        categoryId,
        colorId,
        sizeId,
        images: {
          deleteMany: {}
        },
        isArchived,
        isFeatured
      }
    })

    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)]
          }
        },
        variations: {
          createMany: {
            data: [
              ...variations.map(
                (variation: { name: string; price: number }) => variation
              )
            ]
          }
        },
        bundles: {
          createMany: {
            data: [
              ...bundles.map(
                (bundle: { minQuantity: number; discount: number }) => bundle
              )
            ]
          }
        }
      }
    })

    // call webhook to update product on frontend

    await axios.post(
      REVALIDATE_URL,
      {
        tag: 'product'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REVALIDATE_TOKEN}`
        }
      }
    )

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) return new NextResponse('Unauthenticated', { status: 401 })

    if (!params.productId)
      return new NextResponse('Product ID is required', { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: userId
      }
    })

    if (!storeWithUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}
