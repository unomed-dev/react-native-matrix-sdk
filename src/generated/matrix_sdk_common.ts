// This file was autogenerated by some hot garbage in the `uniffi-bindgen-react-native` crate.
// Trust me, you don't want to mess with it!
import nativeModule, {
  type UniffiRustFutureContinuationCallback,
  type UniffiForeignFutureFree,
  type UniffiCallbackInterfaceFree,
  type UniffiForeignFuture,
  type UniffiForeignFutureStructU8,
  type UniffiForeignFutureCompleteU8,
  type UniffiForeignFutureStructI8,
  type UniffiForeignFutureCompleteI8,
  type UniffiForeignFutureStructU16,
  type UniffiForeignFutureCompleteU16,
  type UniffiForeignFutureStructI16,
  type UniffiForeignFutureCompleteI16,
  type UniffiForeignFutureStructU32,
  type UniffiForeignFutureCompleteU32,
  type UniffiForeignFutureStructI32,
  type UniffiForeignFutureCompleteI32,
  type UniffiForeignFutureStructU64,
  type UniffiForeignFutureCompleteU64,
  type UniffiForeignFutureStructI64,
  type UniffiForeignFutureCompleteI64,
  type UniffiForeignFutureStructF32,
  type UniffiForeignFutureCompleteF32,
  type UniffiForeignFutureStructF64,
  type UniffiForeignFutureCompleteF64,
  type UniffiForeignFutureStructPointer,
  type UniffiForeignFutureCompletePointer,
  type UniffiForeignFutureStructRustBuffer,
  type UniffiForeignFutureCompleteRustBuffer,
  type UniffiForeignFutureStructVoid,
  type UniffiForeignFutureCompleteVoid,
} from './matrix_sdk_common-ffi';
import {
  type FfiConverter,
  AbstractFfiConverterArrayBuffer,
  FfiConverterInt32,
  RustBuffer,
  UniffiInternalError,
  rustCall,
} from 'uniffi-bindgen-react-native';

// Get converters from the other files, if any.

const uniffiIsDebug =
  // @ts-ignore -- The process global might not be defined
  typeof process !== 'object' ||
  // @ts-ignore -- The process global might not be defined
  process?.env?.NODE_ENV !== 'production' ||
  false;
// Public interface members begin here.

const stringToArrayBuffer = (s: string): ArrayBuffer =>
  rustCall((status) =>
    nativeModule().uniffi_internal_fn_func_ffi__string_to_arraybuffer(s, status)
  );

const arrayBufferToString = (ab: ArrayBuffer): string =>
  rustCall((status) =>
    nativeModule().uniffi_internal_fn_func_ffi__arraybuffer_to_string(
      ab,
      status
    )
  );

const stringByteLength = (s: string): number =>
  rustCall((status) =>
    nativeModule().uniffi_internal_fn_func_ffi__string_to_byte_length(s, status)
  );

const FfiConverterString = (() => {
  const lengthConverter = FfiConverterInt32;
  type TypeName = string;
  class FFIConverter implements FfiConverter<ArrayBuffer, TypeName> {
    lift(value: ArrayBuffer): TypeName {
      return arrayBufferToString(value);
    }
    lower(value: TypeName): ArrayBuffer {
      return stringToArrayBuffer(value);
    }
    read(from: RustBuffer): TypeName {
      const length = lengthConverter.read(from);
      const bytes = from.readBytes(length);
      return arrayBufferToString(bytes);
    }
    write(value: TypeName, into: RustBuffer): void {
      const buffer = stringToArrayBuffer(value);
      const numBytes = buffer.byteLength;
      lengthConverter.write(numBytes, into);
      into.writeBytes(buffer);
    }
    allocationSize(value: TypeName): number {
      return lengthConverter.allocationSize(0) + stringByteLength(value);
    }
  }

  return new FFIConverter();
})();

/**
 * A machine-readable representation of the authenticity for a `ShieldState`.
 */
export enum ShieldStateCode {
  /**
   * Not enough information available to check the authenticity.
   */
  AuthenticityNotGuaranteed,
  /**
   * The sending device isn't yet known by the Client.
   */
  UnknownDevice,
  /**
   * The sending device hasn't been verified by the sender.
   */
  UnsignedDevice,
  /**
   * The sender hasn't been verified by the Client's user.
   */
  UnverifiedIdentity,
  /**
   * An unencrypted event in an encrypted room.
   */
  SentInClear,
  /**
   * The sender was previously verified but changed their identity.
   */
  VerificationViolation,
}

const FfiConverterTypeShieldStateCode = (() => {
  const ordinalConverter = FfiConverterInt32;
  type TypeName = ShieldStateCode;
  class FFIConverter extends AbstractFfiConverterArrayBuffer<TypeName> {
    read(from: RustBuffer): TypeName {
      switch (ordinalConverter.read(from)) {
        case 1:
          return ShieldStateCode.AuthenticityNotGuaranteed;
        case 2:
          return ShieldStateCode.UnknownDevice;
        case 3:
          return ShieldStateCode.UnsignedDevice;
        case 4:
          return ShieldStateCode.UnverifiedIdentity;
        case 5:
          return ShieldStateCode.SentInClear;
        case 6:
          return ShieldStateCode.VerificationViolation;
        default:
          throw new UniffiInternalError.UnexpectedEnumCase();
      }
    }
    write(value: TypeName, into: RustBuffer): void {
      switch (value) {
        case ShieldStateCode.AuthenticityNotGuaranteed:
          return ordinalConverter.write(1, into);
        case ShieldStateCode.UnknownDevice:
          return ordinalConverter.write(2, into);
        case ShieldStateCode.UnsignedDevice:
          return ordinalConverter.write(3, into);
        case ShieldStateCode.UnverifiedIdentity:
          return ordinalConverter.write(4, into);
        case ShieldStateCode.SentInClear:
          return ordinalConverter.write(5, into);
        case ShieldStateCode.VerificationViolation:
          return ordinalConverter.write(6, into);
      }
    }
    allocationSize(value: TypeName): number {
      return ordinalConverter.allocationSize(0);
    }
  }
  return new FFIConverter();
})();

/**
 * This should be called before anything else.
 *
 * It is likely that this is being done for you by the library's `index.ts`.
 *
 * It checks versions of uniffi between when the Rust scaffolding was generated
 * and when the bindings were generated.
 *
 * It also initializes the machinery to enable Rust to talk back to Javascript.
 */
function uniffiEnsureInitialized() {
  // Get the bindings contract version from our ComponentInterface
  const bindingsContractVersion = 26;
  // Get the scaffolding contract version by calling the into the dylib
  const scaffoldingContractVersion =
    nativeModule().ffi_matrix_sdk_common_uniffi_contract_version();
  if (bindingsContractVersion !== scaffoldingContractVersion) {
    throw new UniffiInternalError.ContractVersionMismatch(
      scaffoldingContractVersion,
      bindingsContractVersion
    );
  }
}

export default Object.freeze({
  initialize: uniffiEnsureInitialized,
  converters: {
    FfiConverterTypeShieldStateCode,
  },
});
