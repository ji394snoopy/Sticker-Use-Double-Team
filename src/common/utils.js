const path = require('path');
const fs = require('fs');

module.exports.cloneJson = function(json) {
  return JSON.parse(JSON.stringify(json));
};

module.exports.readFileToBuffer = function(path) {
  return new Promise((res, rej) => {
    fs.readFile(path, { encoding: 'utf8' }, function(err, data) {
      if (err) {
        rej(err);
        return;
      }
      res(data);
      return;
    });
  });
};

module.exports.readFileToInputStream = function(path) {
  return new Promise((res) => {
    res(fs.createReadStream(path));
  });
};

module.exports.mkdirParent = function(_path, mode, callback) {
  // allow the `mode` parameter to be optional
  if (typeof mode === 'function') {
    callback = mode;
    mode = 0777;
  }
  // Call the standard fs.mkdir
  fs.mkdir(_path, mode, function(error) {
    // When it fail in this way, do the custom steps

    // Create all the parents recursively
    if (error && error.code === 'ENOENT')
      fs.mkdir(
        path.dirname(_path),
        mode,
        fs.mkdir.bind(this, _path, mode, callback)
      );
    // Manually run the callback since we used our own callback to do all these
    else if (callback) callback(error);
  });
};

// module.exports.compose = function(f, g, h) {
//   return function(x) {
//     return f(g(h(x)));
//   };
// };

module.exports.compose = function(...fn) {
  return function(...param) {
    return fn.reverse().reduce((a, b) => {
      return a(b.apply(param));
    });
  };
};
