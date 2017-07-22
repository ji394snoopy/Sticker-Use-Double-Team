const telebot = require('TeleBot');
const client = require('./Client-line');
const firebase = require('./storage');
const _ = require('./util');
const cmd = require('./cmd.js');
const rImage = require('./resizeImage.js');

const bot = new telebot('335642178:AAHnm4l9LJ_9Ovgu5S6Vd5c2cUNLxpQom6Q');
const regHref = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?(\ ? (.)*)?/g;
const log = console.log;
const dbRef = firebase.getRef('/');

var stickerList = {};

//get first list
(function() {
  firebase.getValueBy(dbRef).then(obj => {
    let _list = obj.val();
    log(_list);
    if (!_list) return log('no data');
    stickerList = _.cloneJson(_list);
  }, error => {
    console.log(error);
  });
})();

// bot.on('text',msg => {
//   log('text');
//   return bot.sendMessage(msg.from.id,'get text');
// });

bot.on(/^\/DT ls$/, msg => {
  log('ls stickers');
  let _stickerList = _.cloneJson(stickerList);
  var ls = '',
    count = 0;
  for (key in _stickerList) {
    count += 1;
    ls += count + ') ' + key + ' -> ' + _stickerList[key] + ' \n\n';
  }
  return bot.sendMessage(msg.chat.id, 'these are all stickers I\'ve saved:\n' + ls);
});

bot.on(/^\/DT (.+)$/, (msg, props) => {
  let href = props.match[1];
  if (href === 'ls') return;
  var hrefArr = href.split('/');
  let _id = hrefArr.pop();
  if (!parseInt(_id))
    _id = hrefArr.pop();

  if (!href.match(regHref))
    return bot.sendMessage(msg.chat.id, '[' + href + '] is not a valid url. \nplz try another one!');

  //query if exist
  if (stickerList[_id])
    return bot.sendMessage(msg.chat.id, stickerList[_id]);

  bot.sendMessage(msg.chat.id, ' start crawl...');
  client.processing(href, function(length, filepath) {
    var runShell = function() {
      cmd.runShellOf(_id, length - 1,
        function(line) { //on data

        },
        function(line) { //on error
          return bot.sendMessage(msg.chat.id, 'sorry ! \nthere is some technical issue occur... \nplz message @ji394snoopy');
        },
        function(code) { //on close
          stickerList[_id] = 'https://t.me/addstickers/sudt2' + _id;
          firebase.setValueWith(dbRef, stickerList);
          return bot.sendMessage(msg.chat.id, 'DONE ! here is your link: https://t.me/addstickers/sudt2' + _id);
        });
    };

    //resize image 
    _.mkdirParent(filepath + '/resized', 0777, function(error) {
      if (error && error.code != 'EEXIST') {
        log('error in mkdirParent');
        log(error);
        return;
      }
      var count = 0;
      for (var i = 0; i < length; i++) {
        rImage.resizeConst(filepath + '/' + i + '.png', filepath + '/resized/' + i + '.png', function() {
          count += 1;
          if (count == length)
            runShell();
        });
      }
    });
  });
});

dbRef.on('child_added', function(data) {
  //update list
  // log('added' + data);
});

dbRef.on('child_changed', function(data) {
  //update list
  // log('changed' + data);
});



bot.start();
