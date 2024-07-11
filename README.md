# react-native-matrix-sdk

Matrix client SDK for React Native

[![CI](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/unomed-dev/react-native-matrix-sdk/actions/workflows/ci.yml)

This SDK wraps the FFI bindings of [matrix-rust-sdk] for use in React Native via
[matrix-rust-components-kotlin] and [matrix-rust-components-swift].


## Installation

Since this is a fairly young project we're not making releases yet. To use the module,
clone the repository into a sibling folder of your app and then install it with e.g.

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


## Usage

See [src/index.tsx] for the module's full API. You may also find a usage example
in [example/src/App.tsx].

Objects that have a `destroy` method live on the native side and need to be explicitly
deallocated by calling `obj.destroy()` to prevent memory leaks.


## Contributing

See the [contributing guide] to learn about the development and contribution workflow.


## License

Apache-2.0


[contributing guide]: CONTRIBUTING.md
[matrix-rust-components-kotlin]: https://github.com/matrix-org/matrix-rust-components-kotlin
[matrix-rust-components-swift]: https://github.com/matrix-org/matrix-rust-components-swift
[matrix-rust-sdk]: https://github.com/matrix-org/matrix-rust-sdk
