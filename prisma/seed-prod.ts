import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting states import...')

    // First, clear existing states
    await prisma.state.deleteMany({})

    // Reset the ID sequence
    await prisma.$executeRaw`ALTER SEQUENCE states_id_seq RESTART WITH 1;`

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'seed', 'states.sql')
    const sqlContent = readFileSync(sqlPath, 'utf-8')

    // Extract only valid INSERT statements with a regex approach
    const insertRegex =
      /^(?!--).*INSERT\s+INTO\s+public\.states\s+VALUES\s+\([^;]+\)/gim
    const matches = sqlContent.match(insertRegex) || []

    console.log(`Found ${matches.length} state records to import`)

    // Process in smaller batches to avoid transaction timeouts
    const BATCH_SIZE = 100
    let successCount = 0

    for (let i = 0; i < matches.length; i += BATCH_SIZE) {
      const batch = matches.slice(i, i + BATCH_SIZE)

      // Use a new transaction for each batch
      await prisma.$transaction(async (tx) => {
        for (const insertStatement of batch) {
          try {
            // Make the statement idempotent
            const idempotentStatement = `${insertStatement} ON CONFLICT (id) DO NOTHING`
            await tx.$executeRawUnsafe(idempotentStatement)
            successCount++
          } catch (error) {
            console.error('Error seeding state:', error)
            console.error('Failed statement:', insertStatement)
            // Don't throw here to allow other statements in batch to continue
          }
        }
      })

      console.log(
        `Imported ${successCount} states so far (batch ${
          i / BATCH_SIZE + 1
        }/${Math.ceil(matches.length / BATCH_SIZE)})`
      )
    }

    console.log(`Successfully imported ${successCount} states`)
  } catch (error) {
    console.error('Error seeding states:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
