const crawl = require('./crawl.js')
const _ = require('./util.js')
const {
  exec
} = require('child_process')

const log = console.log

const createFolder = function (path, callback) {
  _.mkdirParent(path, '0777', function (error) {
    if (error && error.code !== 'EEXIST') {
      log('error in mkdirParent')
      log(error)
      return
    }
    log('downloading .....')

    return callback()
  })
}

const unzip = function (folderpath, filepath, callback) {
  exec('unzip ' + filepath + ' -d ' + folderpath, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return callback(error)
    }
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
    return callback()
  })
}

module.exports.processing = (filename, link, callback) => {
  const folderpath = './zipped/' + filename
  const filepath = folderpath + '/' + filename + '.zip'
  createFolder(folderpath, () => {
    crawl.saveStream(link, filepath, () => {
      log('save zip file at ' + filepath + 'done !')
      unzip(folderpath, filepath, (error) => {
        if (error) return callback(error)
        callback(null, folderpath, filepath)
      })
    })
  })
}
