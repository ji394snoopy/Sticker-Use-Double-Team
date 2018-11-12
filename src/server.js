const express = require('express');
const app = express();

app.set('port', process.env.PORT || 5000);

app.get('/', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('telebot api');
});

module.exports.start = () => {
  const server = app.listen(app.get('port'), function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);
  });
};
