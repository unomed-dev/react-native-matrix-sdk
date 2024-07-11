# Contributing

Contributions are always welcome, no matter how large or small.


## Development workflow

This project is a monorepo managed using [Yarn workspaces]. It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, run `yarn` in the root directory to install the required
dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`] for development.

The [example app] demonstrates usage of the library. You need to run it to test any changes you
make.

It is configured to use the local version of the library, so any changes you make to the library's
source code will be reflected in the example app. Changes to the library's JavaScript code will be
reflected in the example app without a rebuild, but native code changes will require a rebuild of
the example app.

If you want to use Android Studio or Xcode to edit the native code, you can open the
`example/android` or `example/ios` directories respectively in those editors. To edit the
Objective-C or Swift files, open `example/ios/MatrixSdkExample.xcworkspace` in Xcode and find the
source files at `Pods > Development Pods > react-native-matrix-sdk`.

To edit the Java or Kotlin files, open `example/android` in Android studio and find the source
files at `react-native-matrix-sdk` under `Android`.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a
message like this:

```sh
Running "MatrixSdkExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typecheck
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```


### Local matrix-rust-sdk

By default the project is set up to consume the FFI bindings of [matrix-rust-sdk] via public
releases of [matrix-rust-components-kotlin] and [matrix-rust-components-swift]. To build the
bindings from a local checkout, follow the steps below.

For Android, run

```sh
android/build-local-sdk.sh PATH_TO_MATRIX_RUST_COMPONENTS_KOTLIN_CHECKOUT PATH_TO_RUST_SDK_CHECKOUT"
```

To revert back to using the prebuilt remote bindings, delete the `.aar` file under `android/libs`
and the Kotlin files in `android/src/main/java/org` and `android/src/main/java/uniffi`.

For iOS, run

```sh
ios/build-local-sdk.sh PATH_TO_RUST_SDK_CHECKOUT
```

Afterwards, comment out `prepare_command` in `react-native-matrix-sdk.podspec` and run
`pod install` in `example/ios`.

The script will build the bindings for the simulator on Apple Silicon Macs. If you need to
build for a different architecture, change the `--target` argument inside the script.


### Commit message convention

We follow the [conventional commits specification] for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes to documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.


### Linting and tests

We use [TypeScript] for type checking, [ESLint] with [Prettier] for linting and formatting the
code, and [Jest] for testing.

Our pre-commit hooks verify that the linter and tests pass when committing. To install the hooks
run:

```sh
yarn run lefthook install
```


### Publishing to npm

We use [release-it] to make it easier to publish new versions. It handles common tasks like bumping
the version based on semver, creating tags and releases etc.

To publish new versions, run the following:

```sh
yarn release
```


### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.


### Sending a pull request

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.


[conventional commits specification]: https://www.conventionalcommits.org/en
[ESLint]: https://eslint.org/
[example app]: /example/
[Jest]: https://jestjs.io/
[matrix-rust-components-kotlin]: https://github.com/matrix-org/matrix-rust-components-kotlin
[matrix-rust-components-swift]: https://github.com/matrix-org/matrix-rust-components-swift
[matrix-rust-sdk]: https://github.com/matrix-org/matrix-rust-sdk
[`npm`]: https://github.com/npm/cli
[Prettier]: https://prettier.io/
[release-it]: https://github.com/release-it/release-it
[TypeScript]: https://www.typescriptlang.org/
[Yarn workspaces]: https://yarnpkg.com/features/workspaces
