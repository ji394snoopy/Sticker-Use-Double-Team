const spawn = require('child_process').spawn;

module.exports.runScriptFileOf = function(
  scriptType,
  scriptFile,
  fileName,
  fileNum,
  onData,
  onErr,
  onClose
) {
  const child = spawn(scriptType, [scriptFile, fileName, fileNum]);
  child.stdout.setEncoding('utf8');

  child.stdout.on('data', function(data) {
    const lines = data.toString().split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      console.log('stdout: ' + line);
      onData(line);
    }
    // Here is where the output goes
  });

  child.stderr.on('data', function(data) {
    const lines = data.toString().split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      console.log('stderr: ' + line);
      onErr(line);
    }
    // Here is where the error output goes
  });

  child.on('close', function(code) {
    console.log('closing code: ' + code);
    onClose(code);
    // Here you can get the exit code of the script
  });
};
