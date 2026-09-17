#!/usr/bin/env node

const path = require('path');
const { execFileSync } = require('child_process');

const { publish } = require('./publish');

// Flags that make release-it print something and exit without releasing.
const NO_RELEASE_FLAGS = [
  '-d',
  '--dry-run',
  '-h',
  '--help',
  '-v',
  '--version',
  '--release-version',
  '--changelog',
];

function releaseItBin() {
  // release-it only exports its package.json, so resolve the bin through that.
  const packageJsonPath = require.resolve('release-it/package.json');
  const { bin } = require(packageJsonPath);
  return path.join(path.dirname(packageJsonPath), bin['release-it']);
}

function release(args) {
  execFileSync(process.execPath, [releaseItBin(), ...args], { stdio: 'inherit' });

  if (args.some((arg) => NO_RELEASE_FLAGS.includes(arg))) {
    console.log('Nothing was released, skipping npm publish.');
    return;
  }

  publish();
}

if (require.main === module) {
  // yarn appends script arguments to the last command of a script, so they
  // arrive here rather than on release-it. Forward them explicitly.
  try {
    release(process.argv.slice(2));
  } catch (error) {
    // The failing command has already written its own output.
    if (error.status === undefined) {
      throw error;
    }
    process.exit(error.status);
  }
}

module.exports = { release };
