var jimp = require('jimp');

// temp function
module.exports.resizeConst = function (filepath, output, callback) {
  jimp.read(filepath)
    .then(function (image) {
      image.resize(512, 512)
        .write(output, function (err) {
          if (!err) {
            console.log('resize image :' + output + ' Done!');
            callback()
          }
        })
    }).catch(function (err) {
      return console.log(err)
    })
}
