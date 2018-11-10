const jimp = require('jimp');

module.exports.resizeConst = function(filepath, output) {
  return new Promise((res, rej) => {
    jimp
      .read(filepath)
      .then(function(image) {
        image.scaleToFit(512, 512).write(output, function(err) {
          if (!err) {
            console.log('scaleToFit image :' + output + ' Done!');
            res(output);
            return;
          }
        });
      })
      .catch(function(err) {
        rej(err);
        return;
      });
  });
};
