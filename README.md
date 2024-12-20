# react-native-matrix-sdk

⚡️ FFI bindings for [matrix-rust-sdk] in a React Native Turbo Module ⚡️

[![lint](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/lint.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/lint.yml)
[![library](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/library.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/library.yml)
[![android](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/android.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/android.yml)
[![ios](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ios.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ios.yml)

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


## License

Apache-2.0


[contributing guide]: CONTRIBUTING.md
[create-react-native-library]: https://github.com/callstack/react-native-builder-bob
[example/src/App.tsx]: example/src/App.tsx
[matrix-rust-sdk]: https://github.com/matrix-org/matrix-rust-sdk
[npm registry]: https://www.npmjs.com/package/@unomed/react-native-matrix-sdk
[src/index.ts]: src/index.ts
[uniffi-bindgen-react-native]: https://github.com/jhugman/uniffi-bindgen-react-native
