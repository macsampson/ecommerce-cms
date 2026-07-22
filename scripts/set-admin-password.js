const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('Enter password: ', async (password) => {
  if (!password) {
    console.log('Password is required')
    rl.close()
    return
  }

  const hash = await bcrypt.hash(password, 12)
  // Next.js's env loader expands $VAR references, so bcrypt's literal `$`
  // separators must be escaped or the hash gets silently mangled at load time.
  // Backslashes are escaped first so the two replacements can't collide.
  const escapedHash = hash.replace(/\\/g, '\\\\').replace(/\$/g, '\\$')
  const envPath = path.join(process.cwd(), '.env.local')
  let contents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''

  if (/^ADMIN_PASSWORD_HASH=.*$/m.test(contents)) {
    contents = contents.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH="${escapedHash}"`)
  } else {
    contents += `\nADMIN_PASSWORD_HASH="${escapedHash}"\n`
  }

  fs.writeFileSync(envPath, contents)
  console.log('Updated ADMIN_PASSWORD_HASH in .env.local')

  const verify = await bcrypt.compare(password, hash)
  console.log('Self-check:', verify)

  rl.close()
})
