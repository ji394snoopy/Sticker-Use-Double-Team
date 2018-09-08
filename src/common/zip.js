const crawl = require('./../spider/crawl.js');
const utils = require('./utils.js');
const { exec } = require('child_process');

const cLog = console.log;

const createFolder = function(path, callback) {
  utils.mkdirParent(path, '0777', function(error) {
    if (error && error.code !== 'EEXIST') {
      cLog('error in mkdirParent');
      cLog(error);
      return;
    }
    cLog('downloading .....');

    return callback();
  });
};

const unzip = function(folderpath, filepath, callback) {
  exec('unzip ' + filepath + ' -d ' + folderpath, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return callback(error);
    }
    cLog(`stdout: ${stdout}`);
    cLog(`stderr: ${stderr}`);
    return callback();
  });
};

module.exports.processing = (filename, link, callback) => {
  const folderpath = './zipped/' + filename;
  const filepath = folderpath + '/' + filename + '.zip';
  createFolder(folderpath, () => {
    crawl.saveStream(link, filepath, () => {
      cLog('save zip file at ' + filepath + 'done !');
      unzip(folderpath, filepath, error => {
        if (error) return callback(error);
        callback(null, folderpath, filepath);
      });
    });
  });
};
