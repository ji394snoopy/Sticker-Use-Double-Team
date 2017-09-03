const crawl = require('./crawl.js')
const _ = require('./util.js')

const log = console.log

// /////////////////////// //
// main declare parameter  //
// /////////////////////// //

module.exports.processing = function (name, link, callback) {
  crawl.downloading(link, function () {
    // unzip file
  })
}
