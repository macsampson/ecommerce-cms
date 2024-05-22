// pages/api/checkout/checkout-session.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// create options method
export async function OPTIONS(req: Request, res: Response) {}

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session_id = params.sessionId
  // console.log(session_id)

  try {
    const session = await stripe.checkout.sessions.retrieve(
      session_id as string
    )
    // return customer name and email from session.customer_details
    if (session.customer_details) {
      const { name, email } = session.customer_details
      return new NextResponse(JSON.stringify({ name, email }))
    }
  } catch (error: any) {
    return new NextResponse(error.message, { status: error.statusCode })
  }
}
