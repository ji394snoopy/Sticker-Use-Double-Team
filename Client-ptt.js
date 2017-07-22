var cheerio = require('cheerio');

var $ = cheerio.load(body);
console.log('Status:' + res.statusCode);
saving(getFileName(url, res.statusCode), body)
if (res.statusCode == 302) {
  console.log('302 crawl again');
  $('a').map(function(aTag) {
    processing(aTag.attr('href'));
  });
}
$('a').each(function(index, aTag) {
  console.log($(this).attr('href'));
});
saving(getFileName(url, res.statusCode), body);
