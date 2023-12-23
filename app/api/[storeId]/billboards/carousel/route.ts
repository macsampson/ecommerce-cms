import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

import { auth } from "@clerk/nextjs"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const carouselImages = await prismadb.carouselImage.findMany({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.log("[CAROUSEL_IMAGES_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const { images } = body
    // console.log("image urls: ", images)

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 })

    if (!images)
      return new NextResponse("Image URL is required", { status: 400 })

    // create many carousel images
    const carouselImages = await prismadb.carouselImage.createMany({
      data: images.map((image: { imageUrl: string }) => ({
        imageUrl: image.imageUrl,
        storeId: params.storeId,
      })),
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.log("[CAROUSEL_IMAGES_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const { images } = body
    // console.log("image urls: ", images)

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 })

    if (!images)
      return new NextResponse("Image URL is required", { status: 400 })

    // delete all carousel images
    await prismadb.carouselImage.deleteMany({
      where: {
        storeId: params.storeId,
      },
    })

    // create many carousel images with imageUrl and storeId
    const carouselImages = await prismadb.carouselImage.createMany({
      data: images.map((image: { imageUrl: string }) => ({
        imageUrl: image.imageUrl,
        storeId: params.storeId,
      })),
    })

    return NextResponse.json(carouselImages)
  } catch (error) {
    console.log("[CAROUSEL_IMAGES_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
