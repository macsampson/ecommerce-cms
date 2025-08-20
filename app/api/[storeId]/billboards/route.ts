import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { useParams } from "next/navigation"

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { label, imageUrl, landingPage } = body

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!label) return new NextResponse("Label is required", { status: 400 })

    if (!imageUrl)
      return new NextResponse("Image URL is required", { status: 400 })

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    if (!storeWithUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

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
      prismadb.billboard.create({
        data: {
          label,
          imageUrl,
          landingPage,
          storeId: params.storeId,
        },
      })
    )

    const billboard = await prismadb.$transaction(operations)

    // const billboard = await prismadb.billboard.create({
    //   data: {
    //     label,
    //     imageUrl,
    //     landingPage,
    //     storeId: params.storeId,
    //   },
    // })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(billboards)
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
