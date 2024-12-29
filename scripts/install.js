const fs = require("fs");
const fetch = require("node-fetch");
const semver = require("semver");
const unzipper = require("unzipper");
const { chmodSync } = require("fs-chmod");
const pkg = require("../package.json");

require("dotenv").config();

const supportedPlatforms = ["darwin", "linux", "win32"];

function getBinaryUrl() {
  const endpoint = "https://github.com/justxd22/qml-parser/releases/download";
  const version = semver.coerce(pkg.version);
  const { platform } = process;

  if (!supportedPlatforms.includes(platform)) {
    throw new Error(`Unsupported ${platform} platform.`);
  }

  if (platform === "win32") {
    return `${endpoint}/v${version}/windows.zip`;  // Windows binary
  }
  else return `${endpoint}/v${version}/${platform}.zip`;
}

(async function main() {
  if (process.env.QML_PARSER_DISABLE_DOWNLOAD) {
    console.log(
      '**INFO** Skipping binary download. "QML_PARSER_DISABLE_DOWNLOAD" environment variable was found.'
    );
    return;
  }

  const binaryUrl = getBinaryUrl();
  const installPath = `${__dirname}/../vendor`;

  console.log("**INFO** Downloading binary from", binaryUrl);

  if (fs.existsSync(installPath)) {
    fs.rmdirSync(installPath, { recursive: true });
  }
  fs.mkdirSync(installPath);

  const res = await fetch(binaryUrl);

  if (!res.ok) {
    throw new Error("Unable to fetch binaries");
  }

  res.body.pipe(unzipper.Extract({ path: installPath }));

  res.body.on("end", () => {
    if (process.platform === "darwin") {
      fs.symlinkSync(
        `qml-parser.app/Contents/MacOS/qml-parser`,
        `${installPath}/qml-parser`
      );
    } else if (process.platform === "win32") {
      // On Windows, ensure the binary is executable
      fs.renameSync(
        `${installPath}/qml-parser.exe`,
        `${installPath}/qml-parser`
      );
    }

    chmodSync(`${installPath}/qml-parser`, "+x");
  });
})();
