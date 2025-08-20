import prismadb from "@/lib/prismadb"
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log("[BILLBOARD_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { label, imageUrl, landingPage } = body

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    // if (!label) return new NextResponse("Label is required", { status: 400 })

    if (!imageUrl)
      return new NextResponse("Image URL is required", { status: 400 })

    if (!params.billboardId)
      return new NextResponse("Store ID is required", { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    if (!storeWithUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // const billboard = await prismadb.billboard.updateMany({
    //   where: {
    //     id: params.billboardId,
    //   },
    //   data: {
    //     label,
    //     imageUrl,
    //     landingPage,
    //   },
    // })

    const operations: any[] = []

    if (landingPage) {
      operations.push(
        prismadb.billboard.updateMany({
          where: {
            landingPage: true,
          },
          data: {
            landingPage: false,
          },
        })
      )
    }

    operations.push(
      prismadb.billboard.updateMany({
        where: {
          id: params.billboardId,
        },
        data: {
          label,
          imageUrl,
          landingPage,
        },
      })
    )

    const billboard = await prismadb.$transaction(operations)

    return NextResponse.json(billboard)
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!params.billboardId)
      return new NextResponse("Billboard ID is required", { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    if (!storeWithUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboardId,
      },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
