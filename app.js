const Telebot = require('TeleBot')
const lineClient = require('./client-line')
const zipClient = require('./client-zip.js')
const firebase = require('./storage')
const _ = require('./util')
const cmd = require('./cmd.js')
const rImage = require('./resizeImage.js')
const config = require('./config')

const bot = new Telebot(config.telebotKey)
const regHref = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-.@:%_+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?( ? (.)*)?/g
const log = console.log
const dbRef = firebase.getRef('/')

var stickerList = {}
var zipList = {}

// get first list
const getList = function () {
  firebase.getValueBy(dbRef).then(obj => {
    let _list = obj.val()
    log(_list)
    if (!_list) return log('no data')
    stickerList = _.cloneJson(_list)
  }, error => {
    console.log(error)
  })
}

// bot.on('text',msg => {
//   log('text')
//   return bot.sendMessage(msg.from.id,'get text')
// })

bot.on(/^\/顯示$/, msg => {
  log('ls stickers')
  let _stickerList = _.cloneJson(stickerList)
  var ls = ''
  var count = 0
  for (var key in _stickerList) {
    count += 1
    ls += count + ') ' + key + ' -> ' + _stickerList[key] + ' \n\n'
  }
  return bot.sendMessage(msg.chat.id, 'these are all stickers I\'ve saved:\n' + ls)
})

// add stickers to developer
bot.on(/^\/上傳 貼圖$/, (msg, prop) => {
  bot.sendMessage(msg.user.id, '請上傳.zip檔，檔案大小不得超過15Ｍb!')
  if (zipList[msg.user.id] && zipList[msg.user.id].isBusy) {
    // stop do work
  } else {
    zipList[msg.user.id] = {
      isBusy: false,
      gonnaWork: true
    }
  }
})

bot.on('file', msg => {
  if (!zipList[msg.user.id] || zipList[msg.user.id].gonnaWork) return
  if (msg.mime_type !== 'application/zip') return bot.sendMessage(msg.user.id, '檔案類型非.zip檔，請轉成可識別格式！')
  if (msg.file_size > 1024 * 1024 * 15) return bot.sendMessage(msg.user.id, '此檔案超出15Mb，請減少至15Ｍb以內！')

  zipClient.processing(msg.file_name, bot.getFile(msg.file_id), function () {

  })
})

// add stickers to user
bot.on(/^\/上傳 自己的貼圖$/)

bot.on(/^\/下載 Line貼圖 (.+)$/, (msg, props) => {
  let href = props.match[1]
  if (href === 'ls') return
  var hrefArr = href.split('/')
  let _id = hrefArr.pop()
  if (!parseInt(_id)) _id = hrefArr.pop()

  if (!href.match(regHref)) return bot.sendMessage(msg.chat.id, '[' + href + '] is not a valid url. \nplz try another one!')

  // query if exist
  if (stickerList[_id]) return bot.sendMessage(msg.chat.id, stickerList[_id])

  bot.sendMessage(msg.chat.id, ' start crawl...')
  lineClient.processing(href, function (length, filepath) {
    // resize image
    _.mkdirParent(filepath + '/resized', '0777', function (error) {
      if (error && error.code !== 'EEXIST') {
        log('error in mkdirParent')
        log(error)
        return
      }
      var count = 0
      for (var i = 0; i < length; i++) {
        rImage.resizeConst(filepath + '/' + i + '.png', filepath + '/resized/' + i + '.png', function () {
          count += 1
          if (count === length) {
            // run Shell Script
            cmd.runScriptFileOf('bash', 'cmd-tg-bot.sh', _id, length - 1,
              function (line) { // on data

              },
              function (line) { // on error
                return bot.sendMessage(msg.chat.id, 'sorry ! \nthere is some technical issue occur... \nplz message @ji394snoopy')
              },
              function (code) { // on close
                stickerList[_id] = 'https://t.me/addstickers/sudt2' + _id
                firebase.setValueWith(dbRef, stickerList)
                return bot.sendMessage(msg.chat.id, 'DONE ! here is your link: https://t.me/addstickers/sudt2' + _id)
              })
          }
        })
      }
    })
  })
})

dbRef.on('child_added', function (data) {
  // update list
  // log('added' + data)
})

dbRef.on('child_changed', function (data) {
  // update list
  // log('changed' + data)
})

getList()
bot.start()
