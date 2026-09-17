#!/usr/bin/env node

const { execFileSync } = require('child_process');

const PACKAGE_JSON = require('../package.json');
const VERSION = PACKAGE_JSON.version;

// Mirrors release-it's dist-tag logic: pre-releases go to their pre-release
// identifier (falling back to next), everything else to latest.
function distTag(version) {
  const prerelease = version.split('-')[1];

  if (!prerelease) {
    return 'latest';
  }

  const id = prerelease.split('.')[0];
  return /^[a-zA-Z][a-zA-Z0-9-]*$/.test(id) ? id : 'next';
}

function publish() {
  const tag = distTag(VERSION);

  console.log(`Publishing ${PACKAGE_JSON.name}@${VERSION} with tag "${tag}"...`);

  // stdio is inherited so that npm keeps the TTY it needs for the browser
  // based 2FA flow. Without a TTY on both stdin and stdout, npm skips it and
  // fails with EOTP instead (see otplease in npm's lib/utils/auth.js).
  execFileSync('npm', ['publish', '--tag', tag], { stdio: 'inherit' });
}

if (require.main === module) {
  publish();
}

module.exports = { publish, distTag };
