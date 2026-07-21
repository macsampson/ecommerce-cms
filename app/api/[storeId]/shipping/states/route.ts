import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'
import { logger } from '@/lib/logger'

export async function OPTIONS(req: Request) {
  return new NextResponse()
}

export async function GET(
  req: Request,
  props: { params: Promise<{ storeId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url)
    const countryCode = searchParams.get('countryCode')
    // logger.info('countryCode: ', countryCode)

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Country code is required'
        },
        { status: 400 }
      )
    }

    const states = await prismadb.$transaction(async (prisma) => {
      return prisma.state.findMany({
        where: {
          countryCode: countryCode,
          flag: 1
        },
        select: {
          id: true,
          name: true,
          type: true,
          iso2: true,
          fipsCode: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    })

    // logger.info('states: ', states)

    // turn id into string
    const statesWithStringId = states.map((state) => ({
      ...state,
      id: state.id.toString()
    }))

    return NextResponse.json({
      success: true,
      states: statesWithStringId
    })
  } catch (error) {
    logger.info('[STATES_GET]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch states'
      },
      { status: 500 }
    )
  }
}
