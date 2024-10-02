#!/bin/bash

set -e

root=$(cd "$(dirname "$0")/.." && pwd)

ubrn="yarn run ubrn"
config="$root/uniffi.yaml"
modules=("matrix_sdk_ffi" "matrix_sdk_ui")

export ANDROID_NDK_HOME=${ANDROID_NDK_HOME:-${ANDROID_SDK_ROOT}/ndk/26.1.10909125/}
export NDK_CLANG_VERSION=17

# Check out & build Rust SDK

$ubrn checkout --config "$config" 2> /dev/null || echo "Already checked out"
$ubrn build android --config "$config"
$ubrn build ios --config "$config"

# Generate TS & C++ bindings

checkout="$root/rust_modules/matrix-rust-sdk"

pushd "$checkout" > /dev/null

$ubrn \
    generate \
    bindings \
    --library \
    --ts-dir "$root/src/generated" \
    --cpp-dir "$root/cpp/generated" \
    "$checkout/target/aarch64-apple-ios/debug/libmatrix_sdk_ffi.a"

popd > /dev/null

# Generate Turbo Module

$ubrn \
    generate \
    turbo-module \
    --config "$config" \
    "${modules[@]}"

# Finalise

pushd "$root/node_modules/uniffi-bindgen-react-native" > /dev/null
../.bin/tsc
popd > /dev/null

pushd example/ios > /dev/null
pod install
popd > /dev/null
