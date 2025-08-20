import prismadb from "@/lib/prismadb"
import { isAuthenticated } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { name } = body

    if (!authenticated) return new NextResponse("Unauthenticated", { status: 401 })

    if (!name) return new NextResponse("Name is required", { status: 400 })

    if (!params.storeId)
      return new NextResponse("Store ID is required", { status: 400 })

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
      data: {
        name: name,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) return new NextResponse("Unauthorized", { status: 401 })

    if (!params.storeId)
      return new NextResponse("Missing storeId", { status: 400 })

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId: "single-user",
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
