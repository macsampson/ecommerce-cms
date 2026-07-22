import { NextResponse } from "next/server"
import { createAdminAccount, login, isAdminConfigured } from "@/lib/auth"
import { logger } from '@/lib/logger'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET() {
  return NextResponse.json({ configured: await isAdminConfigured() })
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const { allowed } = rateLimit(`setup:${ip}`, 5, 60_000)

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429 }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const result = await createAdminAccount(email, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    await login(email, password)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Setup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
