import prismadb from "@/lib/prismadb"
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from "next/server"
import { logger } from '@/lib/logger'

export async function GET(req: Request, props: { params: Promise<{ categoryId: string }> }) {
  const params = await props.params;
  try {
    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        billboard: true,
      },
    })
    // logger.info(category)
    return NextResponse.json(category)
  } catch (error) {
    logger.info("[CATEGORY_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ categoryId: string; storeId: string }> }
) {
  const params = await props.params;
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { name, billboardId } = body

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!name) return new NextResponse("Name is required", { status: 400 })

    if (!billboardId)
      return new NextResponse("Billboard ID is required", { status: 400 })

    if (!params.categoryId)
      return new NextResponse("Category ID is required", { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    if (!storeWithUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const category = await prismadb.category.updateMany({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        billboardId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    logger.info("[CATEGORY_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ storeId: string; categoryId: string }> }
) {
  const params = await props.params;
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!params.categoryId)
      return new NextResponse("Category ID is required", { status: 400 })

    const storeWithUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    if (!storeWithUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const category = await prismadb.category.deleteMany({
      where: {
        id: params.categoryId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    logger.info("[CATEGORY_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
