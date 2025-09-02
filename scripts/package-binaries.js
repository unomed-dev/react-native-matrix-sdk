#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const tar = require('tar');

async function packageBinaries() {
  const projectDir = path.join(__dirname, '..');
  const buildDir = path.join(projectDir, 'build');
  const androidLibsDir = path.join(projectDir, 'android', 'src', 'main', 'jniLibs');
  const outputFile = path.join(projectDir, 'binaries.tar.gz');
  
  if (!fs.existsSync(path.join(buildDir, 'RnMatrixRustSdk.xcframework'))) {
    console.error('No iOS binaries found in build directory. Run yarn generate:release first.');
    process.exit(1);
  }

  if (!fs.existsSync(androidLibsDir)) {
    console.error('No Android binaries found in android/src/main/jniLibs directory. Run yarn generate:release first.');
    process.exit(1);
  }

  console.log('Packaging binaries...');
  
  await tar.c({
    gzip: true,
    file: outputFile,
    cwd: projectDir,
  }, [
    'build',
    'android/src/main/jniLibs'
  ]);
  
  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log(`Binaries packaged successfully: ${outputFile} (${sizeMB} MB)`);
}

if (require.main === module) {
  packageBinaries().catch(console.error);
}

module.exports = { packageBinaries };