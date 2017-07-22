const path = require('path');
const fs = require('fs');

module.exports.cloneJson = function cloneJson(json) {
  return JSON.parse(JSON.stringify(json));
};

module.exports.mkdirParent = function mkdirParent(_path, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(_path, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.code == 'ENOENT') {
      //Create all the parents recursively
      fs.mkdir(path.dirname(_path), mode, fs.mkdir.bind(this, _path, mode, callback));
    }
    //Manually run the callback since we used our own callback to do all these
    else if (callback) callback(error);
  });
};