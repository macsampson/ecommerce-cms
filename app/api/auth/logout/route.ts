import { NextResponse } from "next/server"
import { logout } from "@/lib/auth"
import { logger } from '@/lib/logger'

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}