import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_STORE_NAME = 'Demo Store'

// Idempotent (safe to re-run): finds-or-creates everything by name, scoped to the
// one demo store, so running this again after a demo visitor manages to mutate
// something just fills in whatever's missing rather than duplicating data.
// Orders are the exception — they're only ever created once (see `hasOrders` below),
// since there's no natural unique key to de-duplicate them against on a re-run.
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

  let keycapsCategory = await prisma.category.findFirst({ where: { storeId: store.id, name: 'Keycaps' } })
  if (!keycapsCategory) {
    keycapsCategory = await prisma.category.create({
      data: { storeId: store.id, billboardId: billboard.id, name: 'Keycaps' }
    })
  }

  let deskMatsCategory = await prisma.category.findFirst({ where: { storeId: store.id, name: 'Desk Mats' } })
  if (!deskMatsCategory) {
    deskMatsCategory = await prisma.category.create({
      data: { storeId: store.id, billboardId: billboard.id, name: 'Desk Mats' }
    })
  }

  let size = await prisma.size.findFirst({ where: { storeId: store.id, name: 'Standard' } })
  if (!size) {
    size = await prisma.size.create({ data: { storeId: store.id, name: 'Standard', value: 'std' } })
  }

  let sageGreen = await prisma.color.findFirst({ where: { storeId: store.id, name: 'Sage Green' } })
  if (!sageGreen) {
    sageGreen = await prisma.color.create({ data: { storeId: store.id, name: 'Sage Green', value: '#87A96B' } })
  }

  let charcoal = await prisma.color.findFirst({ where: { storeId: store.id, name: 'Charcoal' } })
  if (!charcoal) {
    charcoal = await prisma.color.create({ data: { storeId: store.id, name: 'Charcoal', value: '#36454F' } })
  }

  const productDefs = [
    {
      name: 'Artisan Keycap — Aurora',
      priceInCents: 4500,
      quantity: 25,
      categoryId: keycapsCategory.id,
      colorId: sageGreen.id,
      description: 'Hand-cast resin keycap with a shifting aurora effect.'
    },
    {
      name: 'Artisan Keycap — Ember',
      priceInCents: 4200,
      quantity: 12,
      categoryId: keycapsCategory.id,
      colorId: charcoal.id,
      description: 'Warm gradient resin keycap, glows faintly under UV.'
    },
    {
      name: 'Keycap Set — Nordic',
      priceInCents: 8900,
      quantity: 8,
      categoryId: keycapsCategory.id,
      colorId: charcoal.id,
      description: '104-key PBT dye-sub set in a muted Nordic palette.'
    },
    {
      name: 'Deskmat — Sage Forest',
      priceInCents: 3200,
      quantity: 18,
      categoryId: deskMatsCategory.id,
      colorId: sageGreen.id,
      description: '900x400mm stitched-edge deskmat, water-resistant surface.'
    },
    {
      name: 'Deskmat — Midnight Charcoal',
      priceInCents: 3200,
      quantity: 0,
      categoryId: deskMatsCategory.id,
      colorId: charcoal.id,
      description: '900x400mm stitched-edge deskmat, sold out — restocking soon.'
    }
  ]

  const products: Record<string, { id: string; priceInCents: number }> = {}
  for (const def of productDefs) {
    let product = await prisma.product.findFirst({ where: { storeId: store.id, name: def.name } })
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: def.name,
          priceInCents: def.priceInCents,
          quantity: def.quantity,
          description: def.description,
          storeId: store.id,
          categoryId: def.categoryId,
          sizeId: size.id,
          colorId: def.colorId,
          isFeatured: true,
          isArchived: false
        }
      })
    }
    products[def.name] = { id: product.id, priceInCents: product.priceInCents }
  }

  const existingActiveSale = await prisma.sale.findFirst({ where: { storeId: store.id, name: 'Launch Week' } })
  if (!existingActiveSale) {
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

  const existingPastSale = await prisma.sale.findFirst({ where: { storeId: store.id, name: 'Spring Clearance' } })
  if (!existingPastSale) {
    await prisma.sale.create({
      data: {
        storeId: store.id,
        name: 'Spring Clearance',
        description: '20% off desk mats, ended.',
        percentage: 20,
        startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        isActive: false,
        isStoreWide: false
      }
    })
  }

  // Orders: only seed once. There's no natural unique key to de-duplicate individual
  // orders against on a re-run, so treat "any orders exist" as "already seeded."
  const hasOrders = (await prisma.order.count({ where: { storeId: store.id } })) > 0
  if (!hasOrders) {
    const customers = [
      { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '604-555-0142', city: 'Vancouver', state: 'BC', zip: 'V6B 1A1' },
      { name: 'Jordan Reyes', email: 'jordan.reyes@example.com', phone: '415-555-0187', city: 'San Francisco', state: 'CA', zip: '94102' },
      { name: 'Mei Lin', email: 'mei.lin@example.com', phone: '212-555-0113', city: 'New York', state: 'NY', zip: '10001' },
      { name: 'Sam O’Connor', email: 'sam.oconnor@example.com', phone: '312-555-0176', city: 'Chicago', state: 'IL', zip: '60601' }
    ]

    const orderPlan: Array<{
      monthsAgo: number
      customer: (typeof customers)[number]
      items: Array<{ name: string; quantity: number }>
      isPaid: boolean
      isAbandoned: boolean
    }> = [
      { monthsAgo: 6, customer: customers[0], items: [{ name: 'Artisan Keycap — Aurora', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 6, customer: customers[1], items: [{ name: 'Keycap Set — Nordic', quantity: 1 }, { name: 'Deskmat — Sage Forest', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 5, customer: customers[2], items: [{ name: 'Artisan Keycap — Ember', quantity: 2 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 5, customer: customers[0], items: [{ name: 'Deskmat — Sage Forest', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 4, customer: customers[3], items: [{ name: 'Keycap Set — Nordic', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 4, customer: customers[1], items: [{ name: 'Artisan Keycap — Aurora', quantity: 1 }, { name: 'Artisan Keycap — Ember', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 3, customer: customers[2], items: [{ name: 'Deskmat — Sage Forest', quantity: 2 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 3, customer: customers[0], items: [{ name: 'Keycap Set — Nordic', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 2, customer: customers[3], items: [{ name: 'Artisan Keycap — Ember', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 2, customer: customers[1], items: [{ name: 'Artisan Keycap — Aurora', quantity: 2 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 1, customer: customers[2], items: [{ name: 'Keycap Set — Nordic', quantity: 1 }, { name: 'Deskmat — Sage Forest', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 1, customer: customers[0], items: [{ name: 'Artisan Keycap — Ember', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 0, customer: customers[3], items: [{ name: 'Artisan Keycap — Aurora', quantity: 1 }], isPaid: true, isAbandoned: false },
      { monthsAgo: 0, customer: customers[1], items: [{ name: 'Deskmat — Sage Forest', quantity: 1 }], isPaid: false, isAbandoned: true },
      { monthsAgo: 0, customer: customers[2], items: [{ name: 'Keycap Set — Nordic', quantity: 1 }], isPaid: false, isAbandoned: false }
    ]

    for (const plan of orderPlan) {
      const createdAt = new Date()
      createdAt.setMonth(createdAt.getMonth() - plan.monthsAgo)
      createdAt.setDate(Math.min(28, 3 + plan.monthsAgo * 2))

      const totalPriceInCents = plan.items.reduce(
        (sum, item) => sum + products[item.name].priceInCents * item.quantity,
        0
      )

      const order = await prisma.order.create({
        data: {
          storeId: store.id,
          isPaid: plan.isPaid,
          isAbandoned: plan.isAbandoned,
          customerName: plan.customer.name,
          emailAddress: plan.customer.email,
          phoneNumber: plan.customer.phone,
          shippingAddress: `123 Main St, ${plan.customer.city}, ${plan.customer.state} ${plan.customer.zip}, US`,
          billingAddress: `123 Main St, ${plan.customer.city}, ${plan.customer.state} ${plan.customer.zip}, US`,
          totalPriceInCents,
          createdAt
        }
      })

      for (const item of plan.items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: products[item.name].id,
            quantity: item.quantity,
            priceInCents: products[item.name].priceInCents,
            name: item.name,
            createdAt
          }
        })
      }
    }

    console.log(`Seeded ${orderPlan.length} orders across ${customers.length} customers.`)
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
