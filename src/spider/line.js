const cheerio = require('cheerio');
const crawl = require('./crawl.js');
const utils = require('./../common/utils.js');

const cLog = console.log;

// checkFilePath then save
/**
 * [saving description]
 * @checkFilePath(callback)
 * @return function(filepath,body) -> callback()
 */

// go crawl and defined response data callback
/**
 * [processing description]
 * @goCrawl(cookie,link,callback)
 * @return callback(urlObj,res,body)
 */
const lineDomAction = function(callback) {
  let count = 0;
  return function(urlObj, res, body) {
    const href = urlObj.href.split('/');
    let lineID = href[href.length - 1];
    while (!lineID || !parseInt(lineID)) {
      lineID = href.pop();
    }
    if (!lineID) {
      callback();
    }
    const $ = cheerio.load(body);
    const lineTitle = $('h3.mdCMN08Ttl').text();

    cLog('callback saving ..........');
    // save original File
    crawl.saving(crawl.getFilePath(urlObj.href, lineID + '.html'), body);

    // search dom for background url
    const path = `./crawledFile/${lineTitle}`;
    utils.mkdirParent(path, '0777', function(error) {
      if (error && error.code !== 'EEXIST') {
        cLog('error in mkdirParent');
        cLog(error);
        return;
      }
      cLog('downloading .....');
      count = $('span.mdCMN09Image').length;
      let len = $('span.mdCMN09Image').length;
      $('span.mdCMN09Image').each(function(index) {
        const url = $(this)
          .css('background-image')
          .split('url(')[1];
        const _path = `${path}/${lineID}_${index + 1}.png`;
        cLog(index + '. ' + url);
        // download Image from url
        crawl.saveStream(url, _path, function() {
          cLog('save image ' + _path + ' done !');
          count -= 1;
          // 結束標記
          if (count === 0 && callback)
            return callback({ lineID, lineTitle }, len, path);
        });
      });
    });
  };
};

module.exports.processing = function(link, callback) {
  crawl.go('', link, lineDomAction(callback));
};

// module.exports.processing = function(callback) {
//   callback()
// }

// var processing = crawl.go('', lineDomAction())

// main process function
// processing(process.argv[2])
