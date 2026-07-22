const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter password to hash: ', async (password) => {
  if (!password) {
    console.log('Password is required')
    process.exit(1)
  }
  
  try {
    const hash = await bcrypt.hash(password, 12)
    // Next.js's env loader expands $VAR references, so bcrypt's literal `$`
    // separators must be escaped or the hash gets silently mangled at load time.
    // Backslashes are escaped first so the two replacements can't collide.
    const escapedHash = hash.replace(/\\/g, '\\\\').replace(/\$/g, '\\$')
    console.log('\nYour password hash:')
    console.log(hash)
    console.log('\nAdd this to your .env file as (note the escaped $ characters — required for Next.js env loading):')
    console.log(`ADMIN_PASSWORD_HASH="${escapedHash}"`)
    console.log('\nPrefer scripts/set-admin-password.js — it writes this to .env.local for you and avoids copy-paste errors.')
  } catch (error) {
    console.error('Error generating hash:', error)
  }
  
  rl.close()
})