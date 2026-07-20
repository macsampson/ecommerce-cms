import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_STORE_NAME = 'Demo Store'

// Idempotent (safe to re-run): finds-or-creates everything by name, scoped to the
// one demo store, so running this again after a demo visitor manages to mutate
// something just fills in whatever's missing rather than duplicating data.
async function main() {
  let store = await prisma.store.findFirst({ where: { name: DEMO_STORE_NAME, userId: 'single-user' } })
  if (!store) {
    store = await prisma.store.create({ data: { name: DEMO_STORE_NAME, userId: 'single-user' } })
  }

  let billboard = await prisma.billboard.findFirst({ where: { storeId: store.id } })
  if (!billboard) {
    billboard = await prisma.billboard.create({
      data: {
        storeId: store.id,
        label: 'Welcome to the Demo Store',
        imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1600',
        landingPage: true
      }
    })
  }

  let category = await prisma.category.findFirst({ where: { storeId: store.id, name: 'Keycaps' } })
  if (!category) {
    category = await prisma.category.create({
      data: { storeId: store.id, billboardId: billboard.id, name: 'Keycaps' }
    })
  }

  let size = await prisma.size.findFirst({ where: { storeId: store.id, name: 'Standard' } })
  if (!size) {
    size = await prisma.size.create({ data: { storeId: store.id, name: 'Standard', value: 'std' } })
  }

  let color = await prisma.color.findFirst({ where: { storeId: store.id, name: 'Sage Green' } })
  if (!color) {
    color = await prisma.color.create({ data: { storeId: store.id, name: 'Sage Green', value: '#87A96B' } })
  }

  const products = [
    {
      name: 'Artisan Keycap — Aurora',
      priceInCents: 4500,
      quantity: 25,
      description: 'Hand-cast resin keycap with a shifting aurora effect.'
    },
    {
      name: 'Artisan Keycap — Ember',
      priceInCents: 4200,
      quantity: 12,
      description: 'Warm gradient resin keycap, glows faintly under UV.'
    },
    {
      name: 'Keycap Set — Nordic',
      priceInCents: 8900,
      quantity: 8,
      description: '104-key PBT dye-sub set in a muted Nordic palette.'
    }
  ]

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { storeId: store.id, name: product.name } })
    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          storeId: store.id,
          categoryId: category.id,
          sizeId: size.id,
          colorId: color.id,
          isFeatured: true
        }
      })
    }
  }

  const existingSale = await prisma.sale.findFirst({ where: { storeId: store.id } })
  if (!existingSale) {
    await prisma.sale.create({
      data: {
        storeId: store.id,
        name: 'Launch Week',
        description: '15% off store-wide to celebrate launch.',
        percentage: 15,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        isStoreWide: true
      }
    })
  }

  console.log(`Demo store ready: ${store.id} ("${store.name}")`)
  console.log('Log in at /login with the DEMO_MODE credentials to browse it.')
}

main()
  .catch((error) => {
    console.error('Error seeding demo data:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
