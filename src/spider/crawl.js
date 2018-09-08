const path = require('path');
const url = require('url');

const fs = require('fs');
const iconv = require('iconv-lite');
const request = require('request');

const cLog = console.log;

/* functions */

// check crawled file is exist with html body
const checkFileExist = function(callback) {
  return function(filepath, body) {
    cLog('check if file exist');
    fs.access(filepath, err => {
      if (!err) {
        cLog('exist ! unlink !');
        fs.unlink(filepath, function(err) {
          if (!err) {
            cLog('unlink file : ' + filepath);
            callback(filepath, body);
          } else {
            cLog('unlink Err : ' + err);
          }
        });
        return;
      }
      cLog('mkfile ... ');
      callback(filepath, body);
    });
  };
};

const saveFile = function(coding) {
  cLog('get encode type');
  const code = coding;
  return function(uri, data, callback) {
    cLog('saving ... ');
    fs.writeFile(uri, encode(data, code), callback);
  };
};

const saveStream = function(uri, filename, callback) {
  cLog('saving stream... ');
  request.head(uri, function(err) {
    if (err) return callback(err);
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

const encode = function(chunk, coding) {
  // turn binary to buffer
  // trun buffer to utf-8
  coding = coding || 'utf-8';
  const buf = Buffer.from(chunk, 'binary');
  const data = iconv.decode(buf, coding);
  return data;
};

// exports

module.exports.getFilesInFolder = function(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) return [];
    return files;
  });
};

module.exports.getUrl = function(str) {
  if (!str) {
    cLog('no path !');
    process.exit();
  } else {
    return str;
  }
};

module.exports.go = function(cookie, link, callback) {
  cLog('get cookie and go -> callback');
  cLog('get link: ' + link);
  if (!link) return;
  const urlObj = url.parse(link);
  if (!urlObj.hostname) return;
  cLog('start request !');
  request(
    {
      url: link,
      headers: {
        Cookie: cookie
      },
      encoding: null
    },
    function(err, res, body) {
      // body if setencode null return buffer
      if (err || !body) {
        cLog(err);
        return;
      }
      cLog('response callback');
      callback(urlObj, res, body);
    }
  );
};

module.exports.getFilePath = function(url, filename) {
  cLog('format file path');
  const str =
    filename ||
    path
      .replace(/www/g, '')
      .replace(/\//g, '_')
      .replace('html', '')
      .replace(/\./g, '_') + '.html';
  return './crawledFile/' + str;
};

module.exports.saving = checkFileExist(saveFile);
module.exports.downloading = checkFileExist(saveStream);
module.exports.saveStream = saveStream;
module.exports.checkFileExist = checkFileExist;
module.exports.saveFile = saveFile;
