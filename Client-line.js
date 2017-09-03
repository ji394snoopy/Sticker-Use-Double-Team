const cheerio = require('cheerio')
const crawl = require('./crawl.js')
const _ = require('./util.js')

const log = console.log

// /////////////////////// //
// main declare parameter  //
// /////////////////////// //

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

let lineDomAction = function (callback) {
  var count = 0
  return function (urlObj, res, body) {
    let href = urlObj.href.split('/')
    let filename = href[href.length - 1]
    let $ = cheerio.load(body)

    log('callback saving ..........')
    // save original File
    crawl.saving(crawl.getFilePath(urlObj.href, (filename + '.html')), body)

    // search dom for background url
    let path = './crawledFile/' + filename
    _.mkdirParent(path, '0777', function (error) {
      if (error && error.code !== 'EEXIST') {
        log('error in mkdirParent')
        log(error)
        return
      }
      log('downloading .....')
      count = $('span.mdCMN09Image').length
      let len = $('span.mdCMN09Image').length
      $('span.mdCMN09Image').each(function (index, el) {
        let url = $(this).css('background-image').split('url(')[1]
        let _path = path + '/' + index + '.png'
        log(index + '. ' + url)
        // download Image from url
        crawl.saveStream(url, _path, function () {
          log('save image ' + _path + 'done !')
          count -= 1
          // 結束標記
          if (count === 0 && callback) return callback(len, path)
        })
      })
    })
  }
}

module.exports.processing = function (link, callback) {
  crawl.go('', link, lineDomAction(callback))
}

// module.exports.processing = function(callback) {
//   callback()
// }

// var processing = crawl.go('', lineDomAction())

// main process function
// processing(process.argv[2])
