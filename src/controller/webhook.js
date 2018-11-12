const line = require('../spider/line');
const utils = require('../common/utils');
const resizeImage = require('../common/resizeImage');
const MSG = require('../common/parameters').MSG;
const getLink = require('../common/parameters').getLink;
const emojis = require('../common/emojis');

const regHref = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-.@:%_+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?( ? (.)*)?/g;
const cLog = console.log;
const startServerTime = Math.floor(new Date().getTime() / 1000);

let stickerList = {};

// 起server前的訊息ignore
const checkTime = t => {
  return startServerTime >= Number(t);
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
        if (err) return bot.sendMessage(msg.chat.id, MSG.ERR.SYSTEM);
        // on close
        stickerList[_id] = getLink(_id);
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
module.exports.set = bot => {
  bot.on('text', msg => {
    if (checkTime(msg.date)) return;
    cLog('text');
    return bot.sendMessage(msg.from.id, 'get text');
  });

  bot.on(/^\/顯示$/, msg => {
    if (checkTime(msg.date)) return;
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
    if (checkTime(msg.date)) return;
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

  // add stickers to user
  bot.on(/^\/上傳 自己的貼圖$/);

  /**
   * create sticker set from line href
   */
  bot.on(/^(\/下載Line貼圖 |){1}(\w.+)$/, (msg, props) => {
    if (checkTime(msg.date)) return;
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
};

// bk
// /**
//  * create sticker set by zip file
//  */
// const zip = require('../common/zip');
// let zipList = {};
// bot.on('file', msg => {
//   if (!zipList[msg.user.id] || zipList[msg.user.id].gonnaWork) return;
//   if (msg.mime_type !== 'application/zip')
//     return bot.sendMessage(msg.user.id, MSG.ERR.ZIP_MIME);
//   if (msg.file_size > 1024 * 1024 * 15)
//     return bot.sendMessage(msg.user.id, MSG.ERR.ZIP_OVER_SIZE);

//   zip.processing(msg.file_name, bot.getFile(msg.file_id), function(
//     error,
//     folderpath
//   ) {
//     if (error) return bot.sendMessage(msg.user.id, MSG.ERR.CREATE);
//     utils.mkdirParent(folderpath + '/resized', '0777', function(error) {
//       if (error && error.code !== 'EEXIST') {
//         cLog('error in mkdirParent');
//         cLog(error);
//         return bot.sendMessage(msg.user.id, MSG.ERR.CREATE);
//       }
//       const files = crawl.getFilesInFolder(folderpath);
//       const length = files.length;
//       const timestamp = Math.floor(Date.now() / 1000);
//       let count = 0;
//       files.forEach(file => {
//         resizeImage.resizeConst(
//           `${folderpath}/${file}.png`,
//           `${folderpath}/resized/${file}.png`,
//           () => {
//             count += 1;
//             if (count === length) {
//               // run Shell Script
//               // cmd.runScriptFileOf(
//               //   'bash',
//               //   'cmd-tg-bot.sh',
//               //   timestamp,
//               //   length - 1,
//               //   function() {
//               //     // on data
//               //   },
//               //   function() {
//               //     // on error
//               //     return bot.sendMessage(msg.chat.id, MSG.ERR.SYSTEM);
//               //   },
//               //   function() {
//               //     // on close
//               //     stickerList[timestamp] = getLink(timestamp);
//               //     dbRef.set(stickerList);
//               //     return bot.sendMessage(
//               //       msg.chat.id,
//               //       MSG.INFO.DONE + getLink(timestamp)
//               //     );
//               //   }
//               // );
//             }
//           }
//         );
//       });
//     });
//   });
// });
