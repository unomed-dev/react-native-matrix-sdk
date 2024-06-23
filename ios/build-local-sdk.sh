#!/bin/bash

function announce {
  echo -e "\033[0;35m> $1\033[0m"
}

if [[ ! -d $1 ]]; then
  >&2 echo "Usage: build-local-sdk.sh PATH_TO_RUST_SDK_CHECKOUT"
  exit 1
fi

announce "Preparing target folder"
target=$(git rev-parse --show-toplevel)/ios/MatrixRustSDK
mkdir -p "${target}"
rm -vf "${target}"/*.swift
rm -rvf "${target}"/*.xcframework
  
announce "Building bindings"
pushd "$1"
unset SDKROOT && cargo xtask swift build-framework \
  --target aarch64-apple-ios-sim # Simulator on Apple Silicon Mac
  # --target x86_64-apple-ios    # Simulator on Intel Mac
  # --target aarch64-apple-ios   # Device

announce "Moving build products into place"
mv -v bindings/apple/generated/MatrixSDKFFI.xcframework "${target}"
mv -v bindings/apple/generated/swift/* "${target}"
