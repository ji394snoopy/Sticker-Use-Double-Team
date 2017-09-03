const path = require('path')
const url = require('url')

const fs = require('fs')
const iconv = require('iconv-lite')
const request = require('request')

const log = console.log
// functions
const checkFileExist = function (callback) {
  return function (filepath, body) {
    log('check if file exist')
    fs.access(filepath, (err) => {
      if (!err) {
        log('exist ! unlink !')
        fs.unlink(filepath, function (err) {
          if (!err) {
            log('unlink file : ' + filepath)
            callback(filepath, body)
          } else {
            log('unlink Err : ' + err)
          }
        })
        return
      }
      log('mkfile ... ')
      callback(filepath, body)
    })
  }
}

const saveFile = function (coding) {
  log('get encode type')
  const code = coding
  return function (uri, data, callback) {
    log('saving ... ')
    fs.writeFile(uri, encode(data, code), callback)
  }
}

const saveStream = function (uri, filename, callback) {
  log('saving stream... ')
  request.head(uri, function (err, res, body) {
    if (err) return callback(err)
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback)
  })
}

const encode = function (chunk, coding) {
  // turn binary to buffer
  // trun buffer to utf-8
  coding = coding || 'utf-8'
  var buf = Buffer.from(chunk, 'binary')
  var data = iconv.decode(buf, coding)
  return data
}

// exports
module.exports.getUrl = function (str) {
  if (!str) {
    log('no path !')
    process.exit()
  } else {
    return str
  }
}

module.exports.go = function (cookie, link, callback) {
  log('get cookie and go -> callback')
  log('get link: ' + link)
  if (!link) return
  var urlObj = url.parse(link)
  if (!urlObj.hostname) return
  log('start request !')
  request({
    url: link,
    headers: {
      'Cookie': cookie
    },
    encoding: null
  }, function (err, res, body) {
    // body if setencode null return buffer
    if (err || !body) {
      log(err)
      return
    }
    log('response callback')
    callback(urlObj, res, body)
  })
}

module.exports.getFilePath = function (url, filename) {
  log('format file path')
  var str = filename || path.replace(/www/g, '').replace(/\//g, '_').replace('html', '').replace(/\./g, '_') + '.html'
  return './crawledFile/' + str
}

module.exports.saving = checkFileExist(saveFile)
module.exports.downloading = checkFileExist(saveStream)
module.exports.saveStream = saveStream
module.exports.checkFileExist = checkFileExist
module.exports.saveFile = saveFile
