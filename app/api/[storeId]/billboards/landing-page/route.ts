import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const landingBoard = await prismadb.billboard.findFirst({
      where: {
        landingPage: true,
      },
    })

    return NextResponse.json(landingBoard)
  } catch (error) {
    console.log("[LANDINGBOARD_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
