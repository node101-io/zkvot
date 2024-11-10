import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { pipeline } from 'stream';
import * as tar from 'tar';
import os from 'os';

const ext = process.platform === 'win32' ? '.exe' : '';

const rustInfo = execSync('rustc -vV').toString();
const targetTriple = /host: (\S+)/g.exec(rustInfo)?.[1];

if (!targetTriple) {
  console.error('Failed to determine platform target triple');
  process.exit(1);
}

let url;
switch (targetTriple) {
  case 'aarch64-apple-darwin':
    url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-darwin-arm64.tar.gz';
    break;
  case 'x86_64-unknown-linux-gnu':
    url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz';
    break;
  case 'x86_64-pc-windows-msvc':
    url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x86.zip';
    break;
  default:
    console.error('Unsupported platform target triple');
    process.exit(1);
}

const outputDir = path.resolve('./bin');
const finalPath = path.join(outputDir, `node-${targetTriple}${ext}`);

// Check if the binary already exists
if (fs.existsSync(finalPath)) {
  console.log(`Binary already exists: ${finalPath}`);
  console.log('Skipping download and extraction.');
  process.exit(0); // Exit successfully
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node-install-'));
const tempArchive = path.join(tempDir, `node-${targetTriple}.tmp`);
const tempExtractDir = path.join(tempDir, 'extract');

// Ensure output and temporary extract directories exist
if (!fs.existsSync(tempExtractDir)) {
  fs.mkdirSync(tempExtractDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download file: ${res.statusCode}`);
    process.exit(1);
  }

  const file = fs.createWriteStream(tempArchive);
  pipeline(res, file, (err) => {
    if (err) {
      console.error('Error while writing file:', err);
      process.exit(1);
    }

    console.log('Download complete, starting unpack process...');

    if (url.endsWith('.tar.gz') || url.endsWith('.tar.xz')) {
      tar
        .x({
          file: tempArchive,
          cwd: tempExtractDir,
          strip: 1,
        })
        .then(() => {
          const binaryPath = path.join(tempExtractDir, 'bin', `node${ext}`);
          fs.renameSync(binaryPath, finalPath);
          console.log(`Node.js binary is ready to use: ${finalPath}`);
          fs.unlinkSync(tempArchive); // Clean up temp archive
        })
        .catch((err) => {
          console.error('Error during extraction:', err);
          process.exit(1);
        });
    } else if (url.endsWith('.zip')) {
      const unzipper = require('unzipper');
      fs.createReadStream(tempArchive)
        .pipe(unzipper.Extract({ path: tempExtractDir }))
        .on('close', () => {
          const binaryPath = path.join(tempExtractDir, `node${ext}`);
          fs.renameSync(binaryPath, finalPath);
          console.log(`Node.js binary is ready to use: ${finalPath}`);
          fs.unlinkSync(tempArchive); // Clean up temp archive
        })
        .on('error', (err) => {
          console.error('Error during extraction:', err);
          process.exit(1);
        });
    } else {
      console.error('Unsupported archive format');
      process.exit(1);
    }
  });
});
