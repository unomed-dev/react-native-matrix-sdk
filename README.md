# react-native-matrix-sdk

⚡️ FFI bindings for [matrix-rust-sdk] in a React Native Turbo Module ⚡️

[![CI](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ci.yml)

Powered by [uniffi-bindgen-react-native].


## Installation

Since this is a fairly young project we're not making releases yet. To use the module,
clone the repository into a sibling folder of your app and then install it using a relative
path.

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

In future, you will be able to install the module from npm.

```sh
npm install @unomed/react-native-matrix-sdk
```


## Usage

See [src/index.ts] for the module's full API. You may also find a usage example
in [example/src/App.tsx].


## Contributing

See the [contributing guide] to learn about the development and contribution workflow.


## License

Apache-2.0


---

Made with [create-react-native-library]


[contributing guide]: CONTRIBUTING.md
[create-react-native-library]: https://github.com/callstack/react-native-builder-bob
[example/src/App.tsx]: example/src/App.tsx
[matrix-rust-sdk]: https://github.com/matrix-org/matrix-rust-sdk
[src/index.ts]: src/index.ts
[uniffi-bindgen-react-native]: https://github.com/jhugman/uniffi-bindgen-react-native
