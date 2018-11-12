const Telebot = require('telebot');
// const config = require('./src/config');
const webhook = require('./src/controller/webhook');
const server = require('./src/server');
// set bot key
const bot = new Telebot(process.env.TELEBOT_KEY);
// set webhook
webhook.set(bot);
// start bot
bot.start();
// start server
server.start();
