import ProductsPage from '@/app/(dashboard)/[storeId]/(routes)/products/page'
import prismadb from '@/lib/prismadb'
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'

import { Decimal } from '@prisma/client/runtime/library'
import axios from 'axios'
// import { v4 as uuidv4 } from 'uuid'

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
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const {
      name,
      images,
      quantity,
      description,
      weight,
      categoryId,
      colorId,
      sizeId,
      price,
      variations,
      bundles,
      isFeatured,
      isArchived
    } = body

    // console.log('images', images)

    if (!authenticated) return new NextResponse('Unauthenticated', { status: 401 })

    if (!name) return new NextResponse('Name is required', { status: 400 })

    if (!images || !images.length) {
      return new NextResponse('At least one image is required', { status: 400 })
    }

    if (!weight) return new NextResponse('Weight is required', { status: 400 })

    if (!price) return new NextResponse('Price ID is required', { status: 400 })

    if (!categoryId)
      return new NextResponse('Category ID  is required', { status: 400 })

    if (!params.productId)
      return new NextResponse('Product ID is required', { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user"
      }
    })

    if (!storeWithUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const existingProduct = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        variations: true,
        bundles: true,
        images: true
      }
    })

    // Separate bundles for update vs create operations
    const bundlesToUpdate = bundles.filter(
      (bundle: { id?: string }) => bundle.id
    )
    
    const bundlesToCreate = bundles.filter(
      (bundle: { id?: string }) => !bundle.id
    )

    // console.log('existingProduct', existingProduct)

    if (!existingProduct) {
      return new NextResponse('Product not found', { status: 404 })
    }

    const variationsToUpdate = variations.filter(
      (variation: { id: string }) => variation.id
    )

    // console.log('variationsToUpdate', variationsToUpdate)

    const variationsToCreate = variations.filter(
      (variation: { id: string }) => !variation.id
    )

    // console.log('variationsToCreate', variationsToCreate)

    // Update the main product
    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        quantity,
        description,
        weight,
        categoryId,
        colorId,
        sizeId,
        isArchived,
        isFeatured
      }
    })

    // Clean up old variations
    await prismadb.productVariation.deleteMany({
      where: {
        productId: params.productId,
        id: {
          notIn: variationsToUpdate.map(
            (variation: { id: string }) => variation.id
          )
        }
      }
    })

    const existingImageIds = images
      .filter((image: { id?: string }) => image.id)
      .map((image: { id?: string }) => image.id) as string[]

    // Delete images that are no longer in the array
    await prismadb.image.deleteMany({
      where: {
        productId: params.productId,
        id: {
          notIn: existingImageIds
        }
      }
    })

    // get all images and console log
    const allImages = await prismadb.image.findMany({
      where: {
        id: {
          in: existingImageIds
        }
      }
    })

    // console.log('allImages', allImages)

    // Update existing images
    for (const image of images) {
      if (image.id) {
        await prismadb.image.update({
          where: { id: image.id },
          data: {
            credit: image.credit,
            ordering: image.ordering
          }
        })
      }
    }

    // Create new images
    const newImages = images.filter((image: { id?: string }) => !image.id)
    if (newImages.length > 0) {
      await prismadb.image.createMany({
        data: newImages.map((image: { url: string; credit: string; ordering: number }) => ({
          url: image.url,
          credit: image.credit,
          ordering: image.ordering,
          productId: params.productId
        }))
      })
    }

    // await prismadb.image.deleteMany({
    //   where: {
    //     productId: params.productId,
    //     id: {
    //       notIn: imagesWithUuid.map((image: { id: string }) => image.id)
    //     }
    //   }
    // })

    // Delete bundles that are no longer in the array
    await prismadb.bundle.deleteMany({
      where: {
        productId: params.productId,
        id: {
          notIn: bundlesToUpdate.map((bundle: { id: string }) => bundle.id)
        }
      }
    })

    for (const variation of variationsToUpdate) {
      await prismadb.productVariation.update({
        where: {
          id: variation.id
        },
        data: {
          name: variation.name,
          price: variation.price,
          quantity: variation.quantity
        }
      })
    }

    if (variationsToCreate.length) {
      await prismadb.productVariation.createMany({
        data: [
          ...variationsToCreate.map(
            (variation: { name: string; price: number; quantity: number }) => ({
              name: variation.name,
              price: variation.price,
              productId: params.productId,
              quantity: variation.quantity
            })
          )
        ]
      })
    }

    // Update existing bundles
    for (const bundle of bundlesToUpdate) {
      await prismadb.bundle.update({
        where: {
          id: bundle.id
        },
        data: {
          minQuantity: bundle.minQuantity,
          discount: bundle.discount
        }
      })
    }

    // Create new bundles
    if (bundlesToCreate.length > 0) {
      await prismadb.bundle.createMany({
        data: bundlesToCreate.map(
          (bundle: { minQuantity: number; discount: number }) => ({
            minQuantity: bundle.minQuantity,
            discount: bundle.discount,
            productId: params.productId
          })
        )
      })
    }

    // Create new images
    // if (imagesWithUuid.length > 0) {
    //   await prismadb.image.createMany({
    //     data: imagesWithUuid.map(
    //       (image: { url: string; id: string; credit: string }) => ({
    //         url: image.url,
    //         id: image.id,
    //         credit: image.credit,
    //         productId: params.productId
    //       })
    //     )
    //   })
    // }

    const updatedProduct = await prismadb.product.findUnique({
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

    // Fire-and-forget revalidation request to frontend
    if (process.env.FRONTEND_STORE_URL && process.env.REVALIDATE_TOKEN) {
      // Don't await this - let it run in the background
      axios.post(
        REVALIDATE_URL,
        {
          tag: 'product'
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REVALIDATE_TOKEN}`
          }
        }
      ).catch(() => {
        // Silently ignore revalidation failures
        // The frontend will eventually sync on next request
      })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('[PRODUCT_PATCH] Error updating product:', error)
    // Return more specific error information while maintaining security
    if (error instanceof Error) {
      console.error('[PRODUCT_PATCH] Error details:', error.message)
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) return new NextResponse('Unauthenticated', { status: 401 })

    if (!params.productId)
      return new NextResponse('Product ID is required', { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user"
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
