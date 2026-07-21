import prismadb from "@/lib/prismadb"
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from "next/server"
import { logger } from '@/lib/logger'

export async function GET(req: Request, props: { params: Promise<{ sizeId: string }> }) {
  const params = await props.params;
  try {
    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    logger.info("[SIZE_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> }
) {
  const params = await props.params;
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { name, value } = body

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!name) return new NextResponse("Name is required", { status: 400 })

    if (!value) return new NextResponse("Value is required", { status: 400 })

    if (!params.sizeId)
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

    const size = await prismadb.size.updateMany({
      where: {
        id: params.sizeId,
      },
      data: {
        name,
        value,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    logger.info("[SIZE_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  const params = await props.params;
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!params.sizeId)
      return new NextResponse("Size ID is required", { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    if (!storeWithUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const size = await prismadb.size.deleteMany({
      where: {
        id: params.sizeId,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    logger.info("[SIZE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
