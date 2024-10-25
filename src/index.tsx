// Generated by uniffi-bindgen-react-native
import installer from './NativeReactNativeMatrixSdk';

// Register the rust crate with Hermes
installer.installRustCrate();

// Export the generated bindings to the app.
export * from './generated/matrix_sdk';
export * from './generated/matrix_sdk_base';
export * from './generated/matrix_sdk_common';
export * from './generated/matrix_sdk_crypto';
export * from './generated/matrix_sdk_ffi';
export * from './generated/matrix_sdk_ui';

// Initialize the generated bindings: mostly checksums, but also callbacks.
import matrix_sdk_ from './generated/matrix_sdk';
import matrix_sdk_base_ from './generated/matrix_sdk_base';
import matrix_sdk_common_ from './generated/matrix_sdk_common';
import matrix_sdk_crypto_ from './generated/matrix_sdk_crypto';
import matrix_sdk_ffi_ from './generated/matrix_sdk_ffi';
import matrix_sdk_ui_ from './generated/matrix_sdk_ui';

matrix_sdk_.initialize();
matrix_sdk_base_.initialize();
matrix_sdk_common_.initialize();
matrix_sdk_crypto_.initialize();
matrix_sdk_ffi_.initialize();
matrix_sdk_ui_.initialize();