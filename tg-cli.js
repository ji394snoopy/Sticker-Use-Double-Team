const TelegramAPI = require('tg-cli-node')
const config = require('./config')

const Client = new TelegramAPI(config.telegram)
const log = console.log

Client.connect(connection => {
  connection.on('message', message => {
    log('message: ', message)
  })
  connection.on('error', e => {
    log('Error from Telegram API:', e)
  })

  connection.on('disconnect', () => {
    log('Disconnected from Telegram API')
  })
})
