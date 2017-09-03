const path = require('path')

module.exports.telegram = {
  telegram_cli_path: path.join(__dirname, 'tg/bin/telegram-cli'), // path to tg-cli (see https://github.com/vysheng/tg)
  telegram_cli_socket_path: path.join(__dirname, 'socket'), // path for socket file
  server_publickey_path: path.join(__dirname, 'tg/tg-server.pub') // path to server key (traditionally, in %tg_cli_path%/tg-server.pub)
}

module.exports.telebotKey = '335642178:AAHnm4l9LJ_9Ovgu5S6Vd5c2cUNLxpQom6Q';

module.exports.firebase = {
  apiKey: 'AIzaSyAw1IzrOyerZtRKDzyTyjDrzI2ZUCDLfe8',
  authDomain: 'crawledstickers.firebaseapp.com',
  databaseURL: 'https://crawledstickers.firebaseio.com',
  projectId: 'crawledstickers',
  storageBucket: 'crawledstickers.appspot.com',
  messagingSenderId: '779625795018'
}
