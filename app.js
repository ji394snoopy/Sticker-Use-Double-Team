const Telebot = require('TeleBot');
const firebase = require('firebase');

const line = require('./src/spider/line');
const zip = require('./src/common/zip');
const utils = require('./src/common/utils');
// const cmd = require('./cmd.js');
const resizeImage = require('./src/common/resizeImage');
const config = require('./src/config');
const crawl = require('./src/spider/crawl');
const MSG = require('./src/common/parameters').MSG;
const getLink = require('./src/common/parameters').getLink;
const emojis = require('./src/common/emojis');

const bot = new Telebot(config.TELEBOT_KEY);
firebase.initializeApp(config.FIREBASE);

const regHref = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-.@:%_+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?( ? (.)*)?/g;
const cLog = console.log;
const dbRef = firebase.database().ref('/');

let stickerList = {};
let zipList = {};
let bufferArray = [];

// get first list
const getList = function() {
  dbRef.once('value').then(
    obj => {
      let _list = obj.val();
      cLog(_list);
      if (!_list) return cLog(MSG.ERR.EMPTY_DATA);
      stickerList = utils.cloneJson(_list);
    },
    error => {
      console.cLog(error);
    }
  );
};

// do work
const doWork = (msg, href, _id) => {
  bot.sendMessage(msg.chat.id, ' start crawl...');
  line.processing(href, function(info, length, filepath) {
    if (!info) return bot.sendMessage(msg.chat.id, MSG.ERR.HREF(href));
    // resize image
    utils.mkdirParent(filepath + '/resized', '0777', function(error) {
      if (error && error.code !== 'EEXIST') {
        cLog(MSG.ERR.MKDIR);
        cLog(error);
        return bot.sendMessage(msg.chat.id, MSG.ERR.CREATE);
      }

      const doneUpload = err => {
        if (err) {
          // on error
          return bot.sendMessage(msg.chat.id, MSG.ERR.SYSTEM);
        }
        // on close
        stickerList[_id] = getLink(_id);
        // save to firebase
        // dbRef.set(stickerList);
        // return success and url
        return bot.sendMessage(msg.chat.id, MSG.INFO.DONE + getLink(_id));
      };

      const reSizeThenUpload = (max, cnt) => {
        if (cnt === undefined) cnt = max - 1;
        const i = max - cnt;

        resizeImage
          .resizeConst(
            `${filepath}/${info.lineID}_${i}.png`,
            `${filepath}/resized/${info.lineID}_${i}.png`
          )
          .then(filePath => {
            return utils.readFileToInputStream(filePath);
          })
          .then(
            inputStream => {
              if (i === 1)
                return bot.createNewStickerSet(
                  msg.from.id,
                  `SUDT_${info.lineID}_by_SUDT_bot`,
                  info.lineTitle,
                  inputStream,
                  emojis[i - 1]
                );
              else
                return bot.addStickerToSet(
                  msg.from.id,
                  `SUDT_${info.lineID}_by_SUDT_bot`,
                  inputStream,
                  emojis[i - 1]
                );
            },
            err => {
              cLog(err);
              doneUpload(MSG.ERR.SYSTEM);
            }
          )
          .then(
            () => {
              if (--cnt > -1) reSizeThenUpload(max, cnt);
              else {
                cLog('done upload');
                doneUpload();
              }
            },
            err => {
              cLog('error upload: ', err);
            }
          );
      };
      reSizeThenUpload(length);
    });
  });
};

/* webhook */

bot.on('text', msg => {
  cLog('text');
  // const is = fs.createReadStream(
  //   './crawledFile/我就是故意用錯字啦！/zh-Hant_0.png'
  // );
  // bot.sendPhoto(msg.chat.id, is);
  return bot.sendMessage(msg.from.id, 'get text');
});

bot.on(/^\/顯示$/, msg => {
  cLog('ls stickers');
  let _stickerList = utils.cloneJson(stickerList);
  let ls = '';
  let count = 0;
  for (let key in _stickerList) {
    if (!_stickerList.hasOwnProperty(key)) {
      continue;
    }
    count += 1;
    ls += count + ') ' + key + ' -> ' + _stickerList[key] + ' \n\n';
  }
  return bot.sendMessage(
    msg.chat.id,
    "these are all stickers I've saved:\n" + ls
  );
});

// add stickers to developer
bot.on(/^\/上傳 貼圖$/, msg => {
  bot.sendMessage(msg.user.id, MSG.INFO.ZIP_SIZE);
  if (zipList[msg.user.id] && zipList[msg.user.id].isBusy) {
    // stop do work
    cLog(MSG.ERR.IS_BUSY);
  } else {
    zipList[msg.user.id] = {
      isBusy: false,
      gonnaWork: true
    };
  }
});

/**
 * create sticker set by zip file
 */
bot.on('file', msg => {
  if (!zipList[msg.user.id] || zipList[msg.user.id].gonnaWork) return;
  if (msg.mime_type !== 'application/zip')
    return bot.sendMessage(msg.user.id, MSG.ERR.ZIP_MIME);
  if (msg.file_size > 1024 * 1024 * 15)
    return bot.sendMessage(msg.user.id, MSG.ERR.ZIP_OVER_SIZE);

  zip.processing(msg.file_name, bot.getFile(msg.file_id), function(
    error,
    folderpath
  ) {
    if (error) return bot.sendMessage(msg.user.id, MSG.ERR.CREATE);
    utils.mkdirParent(folderpath + '/resized', '0777', function(error) {
      if (error && error.code !== 'EEXIST') {
        cLog('error in mkdirParent');
        cLog(error);
        return bot.sendMessage(msg.user.id, MSG.ERR.CREATE);
      }
      const files = crawl.getFilesInFolder(folderpath);
      const length = files.length;
      const timestamp = Math.floor(Date.now() / 1000);
      let count = 0;
      files.forEach(file => {
        resizeImage.resizeConst(
          `${folderpath}/${file}.png`,
          `${folderpath}/resized/${file}.png`,
          () => {
            count += 1;
            if (count === length) {
              // run Shell Script
              // cmd.runScriptFileOf(
              //   'bash',
              //   'cmd-tg-bot.sh',
              //   timestamp,
              //   length - 1,
              //   function() {
              //     // on data
              //   },
              //   function() {
              //     // on error
              //     return bot.sendMessage(msg.chat.id, MSG.ERR.SYSTEM);
              //   },
              //   function() {
              //     // on close
              //     stickerList[timestamp] = getLink(timestamp);
              //     dbRef.set(stickerList);
              //     return bot.sendMessage(
              //       msg.chat.id,
              //       MSG.INFO.DONE + getLink(timestamp)
              //     );
              //   }
              // );
            }
          }
        );
      });
    });
  });
});

// add stickers to user
bot.on(/^\/上傳 自己的貼圖$/);

/**
 * create sticker set from line href
 */
bot.on(/^(\/下載Line貼圖 |){1}(\w.+)$/, (msg, props) => {
  cLog(JSON.stringify(msg));

  const href = props.match[2];
  // todo: only id
  if (!href.match(regHref))
    return bot.sendMessage(msg.chat.id, MSG.ERR.HREF(href));

  let hrefArr = href.split('/');
  let _id = hrefArr.pop();
  while (!_id || !parseInt(_id)) {
    _id = hrefArr.pop();
  }
  if (!_id) return bot.sendMessage(msg.chat.id, MSG.ERR.HREF(href));

  // query if exist
  if (stickerList[_id]) return bot.sendMessage(msg.chat.id, stickerList[_id]);

  doWork(msg, href, _id);
});

dbRef.on('child_added', function() {
  // update list
  // cLog('added' + data)
});

dbRef.on('child_changed', function() {
  // update list
  // cLog('changed' + data)
});

// getList();
bot.start();
