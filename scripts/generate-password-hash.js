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
    console.log('\nYour password hash:')
    console.log(hash)
    console.log('\nAdd this to your .env file as:')
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`)
  } catch (error) {
    console.error('Error generating hash:', error)
  }
  
  rl.close()
})