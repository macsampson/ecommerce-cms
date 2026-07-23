// pages/api/checkout/checkout-session.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'

// create options method
export async function OPTIONS(
  req: Request,
  props: { params: Promise<{ storeId: string; sessionId: string }> }
) {}

export async function GET(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  const session_id = params.sessionId
  // logger.info(session_id)

  try {
    const session = await stripe.checkout.sessions.retrieve(
      session_id as string
    )
    // return customer name and email from session.customer_details
    if (session.customer_details) {
      const { name, email } = session.customer_details
      return new NextResponse(JSON.stringify({ name, email }))
    }

    return new NextResponse('Customer details not found for this session', {
      status: 404
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: error.statusCode })
  }
}
