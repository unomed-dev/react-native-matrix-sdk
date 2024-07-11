#!/bin/bash

function announce {
  echo -e "\033[0;35m> $1\033[0m"
}

if [[ ! -d $1 || ! -d $2 ]]; then
  >&2 echo "Usage: build-local-sdk.sh PATH_TO_MATRIX_RUST_COMPONENTS_KOTLIN_CHECKOUT PATH_TO_RUST_SDK_CHECKOUT"
  exit 1
fi

pushd "$1"
rust_components_checkout=$(pwd)
popd

pushd "$2"
rust_sdk_checkout=$(pwd)
popd

announce "Preparing target folders"
src_target=$(git rev-parse --show-toplevel)/android/src/main/java
rm -vf "${src_target}/org" "${src_target}/uniffi"
lib_target=$(git rev-parse --show-toplevel)/android/libs
mkdir -p "${lib_target}"
rm -vf "${lib_target}"/*
  
announce "Building bindings"
pushd "$rust_components_checkout"
./scripts/build.sh -p "$rust_sdk_checkout" -m sdk -t aarch64-linux-android -t armv7-linux-androideabi

announce "Moving build products into place"
mv -v sdk/sdk-android/build/outputs/aar/sdk-android-debug.aar "${lib_target}"
mv -v sdk/sdk-android/src/main/kotlin/* "${src_target}"
