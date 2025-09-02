#!/usr/bin/env node
/*
 * Script to sort uniffiEnsureInitialized() calls in generated Kotlin bindings
 * 
 * This fixes non-deterministic ordering caused by HashMap iteration in uniffi v0.29.4
 * See: https://github.com/mozilla/uniffi-rs (potential issue to be reported)
 */

const fs = require('fs');
const path = require('path');

const KOTLIN_FILE_PATH = 'android/src/main/java/org/matrix/rustcomponents/sdk/matrix_sdk_ffi.kt';

function sortUniffiCalls() {
  const filePath = path.resolve(KOTLIN_FILE_PATH);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find the indices of uniffiEnsureInitialized calls
  const uniffiIndices = [];
  const uniffiCalls = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('uniffi.') && line.includes('.uniffiEnsureInitialized()')) {
      uniffiIndices.push(i);
      // Extract just the call part, preserving original indentation
      const match = line.match(/^(\s*)(uniffi\.[^.]+\.uniffiEnsureInitialized\(\))/);
      if (match) {
        uniffiCalls.push({
          indentation: match[1],
          call: match[2],
          originalIndex: i
        });
      }
    }
  }
  
  if (uniffiCalls.length === 0) {
    console.log('No uniffiEnsureInitialized calls found');
    return;
  }

  // Sort the calls alphabetically by module name
  const sortedCalls = [...uniffiCalls].sort((a, b) => {
    const matchA = a.call.match(/uniffi\.([^.]+)\.uniffiEnsureInitialized/);
    const matchB = b.call.match(/uniffi\.([^.]+)\.uniffiEnsureInitialized/);
    const moduleA = matchA ? matchA[1] : '';
    const moduleB = matchB ? matchB[1] : '';
    return moduleA.localeCompare(moduleB);
  });

  // Check if order changed
  const orderChanged = sortedCalls.some((call, index) => 
    call.originalIndex !== uniffiCalls[index].originalIndex
  );

  if (!orderChanged) {
    console.log('✅ uniffiEnsureInitialized calls are already sorted');
    return;
  }

  // Replace the lines with sorted versions
  for (let i = 0; i < uniffiIndices.length; i++) {
    const lineIndex = uniffiIndices[i];
    const sortedCall = sortedCalls[i];
    if (sortedCall) {
      lines[lineIndex] = `${sortedCall.indentation}${sortedCall.call}`;
    }
  }

  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log(`✅ Sorted ${uniffiCalls.length} uniffiEnsureInitialized calls in ${KOTLIN_FILE_PATH}`);
  
  // Show the sorted order for verification
  const moduleNames = sortedCalls
    .map(call => {
      const match = call.call.match(/uniffi\.([^.]+)\.uniffiEnsureInitialized/);
      return match ? match[1] : null;
    })
    .filter(Boolean);
  console.log(`📋 Order: ${moduleNames.join(' → ')}`);
}

if (require.main === module) {
  sortUniffiCalls();
}

module.exports = { sortUniffiCalls };