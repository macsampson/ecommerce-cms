import prismadb from '@/lib/prismadb'
import { NextResponse } from 'next/server'

import { isAuthenticated } from '@/lib/auth'
import { CarouselImage } from '@prisma/client'

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    const carouselImages = await prismadb.carouselImage.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.log('[CAROUSEL_IMAGES_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { images } = body
    // console.log("image urls: ", images)

    if (!authenticated) return new NextResponse('Unauthenticated', { status: 401 })

    if (!images)
      return new NextResponse('Image URL is required', { status: 400 })

    await prismadb.carouselImage.deleteMany({
      where: {
        storeId: params.storeId
      }
    })

    // create many carousel images
    const carouselImages = await prismadb.carouselImage.createMany({
      data: images.map((image: CarouselImage) => ({
        imageUrl: image.imageUrl,
        storeId: params.storeId,
        imageCredit: image.imageCredit
      }))
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.log('[CAROUSEL_IMAGES_POST]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { images } = body
    // console.log("image urls: ", images)

    if (!authenticated) return new NextResponse('Unauthenticated', { status: 401 })

    if (!images)
      return new NextResponse('Image URL is required', { status: 400 })

    // delete all carousel images
    await prismadb.carouselImage.deleteMany({
      where: {
        storeId: params.storeId
      }
    })

    // create many carousel images with imageUrl and storeId
    const carouselImages = await prismadb.carouselImage.createMany({
      data: images.map((image: CarouselImage) => ({
        imageUrl: image.imageUrl,
        storeId: params.storeId,
        imageCredit: image.imageCredit
      }))
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.log('[CAROUSEL_IMAGES_PATCH]', error)
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
