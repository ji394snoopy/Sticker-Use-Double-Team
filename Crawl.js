const http = require('http');
const https = require('https');

const path = require('path');
const url = require('url');

const fs = require('fs');
const iconv = require('iconv-lite');
const request = require('request');

const log = console.log;
// functions
var checkFileExist = function checkFileExist(callback) {
  return function(filepath, body) {
    log('check if file exist');
    fs.access(filepath, (err) => {
      if (!err) {
        log('exist ! unlink !');
        fs.unlink(filepath, function(err) {
          if (!err) {
            log("unlink file : " + filepath);
            callback(filepath, body);
          } else {
            log("unlink Err : " + err);
          }
        });
        return;
      }
      log('mkfile ... ');
      callback(filepath, body);
    });
  }
}

var saveFile = function saveFile(coding) {
  log('get encode type');
  var code = coding;
  return function(uri, data, callback) {
    log('saving ... ');
    fs.writeFile(uri, encode(data, code), callback);
  }
}

var saveStream = function saveStream(uri, filename, callback) {
  log('saving stream... ');
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
}

var encode = function encode(chunk, coding) {
  //turn binary to buffer
  //trun buffer to utf-8
  coding = coding || 'utf-8';
  var buf = new Buffer(chunk, 'binary');
  var data = iconv.decode(buf, coding);
  return data;
}

function compose(f, g, h) {
  return function(x) {
    return f(g(h(x)));
  };
}

//exports
module.exports.getUrl = function getUrl(str) {
  if (!str) {
    log("no path !");
    process.exit();
  } else {
    return str;
  }
}

module.exports.go = function go(cookie, link, callback) {
  log('get cookie and go -> callback');
  log('get link: ' + link);
  if (!link)
    return;
  var urlObj = url.parse(link);
  if (!urlObj.hostname)
    return;
  log('start request !');
  request({
    url: link,
    headers: { 'Cookie': cookie },
    encoding: null
  }, function(err, res, body) {
    //body if setencode null return buffer
    if (err || !body) {
      log(err);
      return;
    }
    log('response callback');
    callback(urlObj, res, body);
  });

}

module.exports.getFilePath = function getFilePathhref(url, filename) {
  log('format file path');
  var str = filename ? filename : path.replace(/www/g, '').replace(/\//g, '_').replace('html', '').replace(/\./g, '_') + ".html";
  return "./crawledFile/" + str;
}



module.exports.saving = checkFileExist(saveFile);
module.exports.downloading = checkFileExist(saveStream);
module.exports.saveStream = saveStream;
module.exports.checkFileExist = checkFileExist;
module.exports.saveFile = saveFile;
