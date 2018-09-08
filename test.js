// const ri = require('./resizeImage');

// ri.resizeConst('./0.png','./test.png',function(res){
// 	console.log(res);
// });

const fs = require('fs');
const rs = fs.createReadStream(
  './crawledFile/我就是故意用錯字啦！/resized/1930824_0.png'
);
console.log(rs.readableLength);
rs.on('end', () => {
  console.log(rs);
});

