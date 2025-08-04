#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const tar = require('tar');

async function packageBinaries() {
  const buildDir = path.join(__dirname, '..', 'build');
  const outputFile = path.join(__dirname, '..', 'binaries.tar.gz');
  
  if (!fs.existsSync(path.join(buildDir, 'RnMatrixRustSdk.xcframework'))) {
    console.error('No binaries found in build directory. Run yarn generate:release first.');
    process.exit(1);
  }

  console.log('Packaging binaries...');
  
  await tar.c({
    gzip: true,
    file: outputFile,
    cwd: buildDir,
  }, ['.']);
  
  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log(`Binaries packaged successfully: ${outputFile} (${sizeMB} MB)`);
}

if (require.main === module) {
  packageBinaries().catch(console.error);
}

module.exports = { packageBinaries };