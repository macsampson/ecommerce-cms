import { NextRequest, NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { encryptShippingSecretFields, sanitizeShippingSettingsForResponse } from '@/lib/shipping-config'
import { isEncryptionConfigured } from '@/lib/secret-crypto'

export async function GET(req: NextRequest, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const { storeId } = params
  const settings = await prismadb.shippingSettings.findUnique({
    where: { storeId }
  })

  if (!settings) {
    return NextResponse.json(settings)
  }

  return NextResponse.json(sanitizeShippingSettingsForResponse(settings))
}

export async function PUT(req: NextRequest, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const { storeId } = params
  const body = await req.json()

  const hasSecretField = 'shippoApiKey' in body || 'chitchatsApiKey' in body
  if (hasSecretField && !isEncryptionConfigured()) {
    return NextResponse.json(
      {
        error:
          'SECRETS_ENCRYPTION_KEY is not set on the server — API keys cannot be stored until it is configured.'
      },
      { status: 500 }
    )
  }

  const data = encryptShippingSecretFields(body)

  // Prisma's upsert() validates the create() branch's required fields even when
  // the row already exists, so a partial payload (e.g. credentials-only) against
  // an existing row would fail. Look the row up first instead.
  const existing = await prismadb.shippingSettings.findUnique({ where: { storeId } })

  let settings
  if (existing) {
    settings = await prismadb.shippingSettings.update({ where: { storeId }, data })
  } else {
    try {
      settings = await prismadb.shippingSettings.create({ data: { storeId, ...data } })
    } catch {
      return NextResponse.json(
        { error: 'Set the sender address for this store before configuring provider credentials.' },
        { status: 400 }
      )
    }
  }

  return NextResponse.json(sanitizeShippingSettingsForResponse(settings))
}
