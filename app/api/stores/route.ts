import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request) {
  try {
    const authenticated = await isAuthenticated()
    const body = await req.json()

    const { name } = body

    if (!authenticated) return new NextResponse("Unauthorized", { status: 401 })
    if (!name) return new NextResponse("Missing name", { status: 400 })

    const store = await prismadb.store.create({
      data: {
        name: name,
        userId: "single-user", // Constant userId for single-user setup
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORES_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
