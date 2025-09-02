#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const tar = require('tar');

const PACKAGE_JSON = require('../package.json');
const VERSION = PACKAGE_JSON.version;
const REPO = 'unomed-dev/react-native-matrix-sdk';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadBinaries() {
  const buildDir = path.join(__dirname, '..', 'build');
  
  // Check if binaries already exist
  if (fs.existsSync(path.join(buildDir, 'RnMatrixRustSdk.xcframework'))) {
    console.log('Binaries already exist, skipping download.');
    return;
  }

  console.log(`Downloading binaries for ${VERSION}...`);
  
  // Create build directory
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const releaseUrl = `https://github.com/${REPO}/releases/download/${VERSION}/binaries.tar.gz`;
  const tempFile = path.join(buildDir, 'binaries.tar.gz');

  try {
    // Download the binary archive
    console.log(`Downloading from ${releaseUrl}...`);
    await downloadFile(releaseUrl, tempFile);
    
    // Extract the archive
    console.log('Extracting binaries...');
    await tar.x({
      file: tempFile,
      cwd: buildDir,
    });
    
    // Clean up
    fs.unlinkSync(tempFile);
    
    console.log('Binaries downloaded successfully!');
  } catch (error) {
    console.error('Failed to download binaries:', error.message);
    console.error('You may need to build the binaries locally using:');
    console.error('  yarn generate:release');
    // Exit gracefully if binaries do not exist
    process.exit(0);
  }
}

if (require.main === module) {
  downloadBinaries().catch(console.error);
}

module.exports = { downloadBinaries };