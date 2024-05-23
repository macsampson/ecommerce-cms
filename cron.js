const cron = require('node-cron')

console.log('Cron job started')
fetch('http://localhost:3000/api/cron', {
  method: 'POST'
})

cron.schedule('30 * * * *', () => {
  console.log('Releasing reserved inventory every 30 minutes in development')
  fetch('http://localhost:3000/api/cron', {
    method: 'POST'
  })
})
