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
    // Modified to exclude commented-out INSERT statements (lines that start with --)
    const insertRegex =
      /^(?!--).*INSERT\s+INTO\s+public\.states\s+VALUES\s+\([^;]+\)/gim
    const matches = sqlContent.match(insertRegex) || []

    console.log(`Found ${matches.length} state records to import`)

    // Start a transaction to ensure all or nothing gets imported
    await prisma.$transaction(async (tx) => {
      // Execute each statement
      let successCount = 0
      for (const insertStatement of matches) {
        try {
          // Make the statement idempotent
          const idempotentStatement = `${insertStatement} ON CONFLICT (id) DO NOTHING`

          // Use $executeRawUnsafe for raw SQL execution
          await tx.$executeRawUnsafe(idempotentStatement)
          successCount++

          // Log progress for large imports
          if (successCount % 500 === 0) {
            console.log(`Imported ${successCount} states so far...`)
          }
        } catch (error) {
          console.error('Error seeding state:', error)
          console.error('Failed statement:', insertStatement)
          throw error // Stop the process if any insert fails
        }
      }

      console.log(`Successfully imported ${successCount} states`)
    })
  } catch (error) {
    console.error('Error seeding states:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
