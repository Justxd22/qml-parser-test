var execSync = require("child_process").execSync;
var lz = require("lz-string");
var os = require("os");
const path = require("path");


require("dotenv").config();

// const binPath = process.env.QML_PARSER_BIN_PATH || `${__dirname}/../vendor`;

function getBinPath() {
  switch (os.platform()) {
    case "darwin":
      return path.join(__dirname, "../vendor/Contents/MacOS/qml-parser");
    case "linux":
      return path.join(__dirname, "../vendor/qml-parser");
    case "win32":
      return path.join(__dirname, "../vendor/qml-parser.exe");
    default:
      throw new Error(`Unsupported ${os.platform()} platform.`);
  }
}

function execute(arg) {
  var bin = getBinPath();
  var result = execSync(bin + " " + arg, { maxBuffer: Infinity });
  var ast = JSON.parse(result);

  if (ast === null) {
    return {};
  }

  return ast;
}

function parse(code) {
  return execute(lz.compressToBase64(code));
}

function parseFile(filepath) {
  return execute(filepath);
}

module.exports = {
  parse: parse,
  parseFile: parseFile,
};
