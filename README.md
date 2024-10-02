# react-native-matrix-sdk

Matrix client SDK for React Native

[![CI](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ci.yml)

This SDK wraps the FFI bindings of [matrix-rust-sdk] for use in React Native via
[uniffi-bindgen-react-native].


## Installation

Since this is a fairly young project we're not making releases yet. To use the module,
clone the repository into a sibling folder of your app and then install it using a relative
path.

```sh
npm add ../react-native-matrix-sdk
```

Additionally you need to change `metro.config.js` to find and watch the module's source
code.

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

In future, you will be able to install the module from npm.

```sh
npm install react-native-matrix-sdk
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
[matrix-rust-sdk]: https://github.com/matrix-org/matrix-rust-sdk
[uniffi-bindgen-react-native]: https://github.com/jhugman/uniffi-bindgen-react-native
