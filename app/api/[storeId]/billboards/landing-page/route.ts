import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"
import { logger } from '@/lib/logger'

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
    logger.info("[LANDINGBOARD_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
