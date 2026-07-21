import { NextRequest, NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'

export async function GET(req: NextRequest, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const { storeId } = params
  const settings = await prismadb.shippingSettings.findUnique({
    where: { storeId }
  })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const { storeId } = params
  const data = await req.json()
  const settings = await prismadb.shippingSettings.upsert({
    where: { storeId },
    update: data,
    create: { storeId, ...data }
  })
  return NextResponse.json(settings)
}
