import { NextRequest, NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { encryptShippingSecretFields, sanitizeShippingSettingsForResponse } from '@/lib/shipping-config'
import { isEncryptionConfigured } from '@/lib/secret-crypto'
import { logger } from '@/lib/logger'

// Only these are writable via PUT — the request body may otherwise carry
// read-only/derived fields (id, createdAt, shippoApiKeyMasked, ...) if the
// caller round-trips a GET response, and Prisma's update() throws on
// anything not a real column.
const WRITABLE_FIELDS = [
  'name',
  'company',
  'street1',
  'city',
  'state',
  'zip',
  'country',
  'phone',
  'email',
  'shippoEnabled',
  'chitchatsEnabled',
  'customsDeclaration',
  'shippoApiKey',
  'chitchatsApiKey',
  'chitchatsApiUrl',
  'chitchatsClientId'
] as const

function pickWritableFields(body: Record<string, unknown>) {
  const result: Record<string, unknown> = {}
  for (const field of WRITABLE_FIELDS) {
    if (field in body) result[field] = body[field]
  }
  return result
}

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

  try {
    const body = pickWritableFields(await req.json())

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
        settings = await prismadb.shippingSettings.create({
          data: { storeId, ...data } as Parameters<
            typeof prismadb.shippingSettings.create
          >[0]['data']
        })
      } catch {
        return NextResponse.json(
          { error: 'Set the sender address for this store before configuring provider credentials.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(sanitizeShippingSettingsForResponse(settings))
  } catch (error) {
    logger.error('[SHIPPING_SETTINGS_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to save shipping settings' },
      { status: 500 }
    )
  }
}
