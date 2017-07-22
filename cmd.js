var spawn = require('child_process').spawn;

module.exports.runShellOf = function(filename, filenum, onData, onErr, onClose) {
  var child = spawn('bash', ['cmd-tg-bot.sh', filename, filenum]);
  child.stdout.setEncoding('utf8');

  child.stdout.on('data', function(data) {
    var lines = data.toString().split("\n");
    for (var i = 0; i < lines.length - 1; i++) {
      var line = lines[i];
      console.log('stdout: ' + line);
      onData(line);
    }
    //Here is where the output goes
  });

  child.stderr.on('data', function(data) {
    var lines = data.toString().split("\n");
    for (var i = 0; i < lines.length - 1; i++) {
      var line = lines[i];
      console.log('stderr: ' + line);
      onErr(line);
    }
    //Here is where the error output goes
  });

  child.on('close', function(code) {
    console.log('closing code: ' + code);
    onClose(code);
    //Here you can get the exit code of the script
  });
}
