# react-native-matrix-sdk

⚡️ FFI bindings for [matrix-rust-sdk] in a React Native Turbo Module ⚡️

[![lint](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/lint.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/lint.yml)
[![library](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/library.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/library.yml)
[![android](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/build-android.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/build-android.yml)
[![ios](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/build-ios.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/build-ios.yml)
[![android](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/build-release.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/build-release.yml)

Powered by [uniffi-bindgen-react-native] and [create-react-native-library].


## Installation

### Installation into your own project

This package is available in the [npm registry].

```sh
npm i @unomed/react-native-matrix-sdk
yarn add @unomed/react-native-matrix-sdk
```


### Installation from local checkout

Clone the repository into a sibling folder of your app and then install the package using
a relative path.

```sh
npm add ../react-native-matrix-sdk
```

You might have to run `yarn prepare` in case it's not executed by default. Additionally you
need to change `metro.config.js` to find and watch the module's source code.

```js
const config = {
  resolver: {
    extraNodeModules: {
      'react-native-matrix-sdk': path.resolve(__dirname, '../react-native-matrix-sdk'),
    }, ...
  },
  watchFolders: [
    path.resolve(__dirname, '../react-native-matrix-sdk'), ...
  ]
};
```

On the first build or any time you update the version of matrix-rust-sdk, you'll have
to rebuild the Rust code and regenerate the module with

```sh
yarn generate
```


## Usage

See [src/index.ts] for the module's full API. You may also find a usage example
in [example/src/App.tsx].


## Contributing

See the [contributing guide] to learn about the development and contribution workflow.


## Making a release

Ensure you have `gh`, the [GitHub CLI](https://cli.github.com/) client, installed and
authenticate it.

```sh
gh auth login
```

Start a release build.

```sh
gh workflow run build-release.yml
```

Grab a _huuuuge_ cup of coffee and check the run status.

```sh
gh run list --workflow=build-release.yml --branch main
```

If the run succeeded, copy its ID. If it is the latest run, you can also get the ID
programmatically.

```sh
RUN_ID=$(gh run list --workflow build-release.yml --branch main --limit 1 --json databaseId --jq ".[0].databaseId")
```

Download the build artifacts.

```sh
rm -rf android/src/main/jniLibs && gh run download $RUN_ID --name android-libs --dir android
rm -rf build/*.xcframework && gh run download $RUN_ID --name xcframework --dir build
```

Test the downloaded binaries locally by building and running the example app on
both platforms.

```sh
yarn example start
```

Build the npm package in a dry run and verify the contained files. Most importantly the
large binary files should *not* be present.

```sh
npm pack --dry-run
```

Create and push a tag for the release.

```sh
git tag $TAG
git push --tags
```

Create the release from the new tag.

```sh
gh release create $TAG --notes "Changelog: https://github.com/unomed-dev/react-native-matrix-sdk/compare/$PREVIOUS_TAG...$TAG"
```

Compress the binaries into archives.

```sh
zip android-libs.zip android/**/*.a
zip -r xcframework.zip build/*.xcframework
```

Upload the binaries to the release.

```sh
gh release upload $RELEASE android-libs.zip xcframework.zip --clobber
```

Publish the release on npmjs.com.

```sh
npm publish --access public
```


## License

Apache-2.0


[contributing guide]: CONTRIBUTING.md
[create-react-native-library]: https://github.com/callstack/react-native-builder-bob
[example/src/App.tsx]: example/src/App.tsx
[GitHub CLI]: https://cli.github.com/
[matrix-rust-sdk]: https://github.com/matrix-org/matrix-rust-sdk
[npm registry]: https://www.npmjs.com/package/@unomed/react-native-matrix-sdk
[src/index.ts]: src/index.ts
[uniffi-bindgen-react-native]: https://github.com/jhugman/uniffi-bindgen-react-native
