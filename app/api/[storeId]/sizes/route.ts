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

    const { name, value } = body

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!name) return new NextResponse("Name is required", { status: 400 })

    if (!value) return new NextResponse("Value is required", { status: 400 })

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

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.log("[SIZES_POST]", error)
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

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(sizes)
  } catch (error) {
    console.log("[SIZES_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
