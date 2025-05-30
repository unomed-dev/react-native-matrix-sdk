// Generated by uniffi-bindgen-react-native
#import "ReactNativeMatrixSdk.h"

namespace uniffi_generated {
    using namespace facebook::react;
    /**
    * ObjC++ class for module 'NativeReactNativeMatrixSdk'
    */
    class JSI_EXPORT NativeReactNativeMatrixSdkSpecJSI : public ObjCTurboModule {
    public:
        NativeReactNativeMatrixSdkSpecJSI(const ObjCTurboModule::InitParams &params);
        std::shared_ptr<CallInvoker> callInvoker;
    };

    static facebook::jsi::Value __hostFunction_ReactNativeMatrixSdk_installRustCrate(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
        auto& tm = static_cast<NativeReactNativeMatrixSdkSpecJSI&>(turboModule);
        auto jsInvoker = tm.callInvoker;
        uint8_t result = unomed_reactnativematrixsdk::installRustCrate(rt, jsInvoker);
        return facebook::jsi::Value(rt, result);
    }
    static facebook::jsi::Value __hostFunction_ReactNativeMatrixSdk_cleanupRustCrate(facebook::jsi::Runtime& rt, TurboModule &turboModule, const facebook::jsi::Value* args, size_t count) {
        uint8_t result = unomed_reactnativematrixsdk::cleanupRustCrate(rt);
        return facebook::jsi::Value(rt, result);
    }

    NativeReactNativeMatrixSdkSpecJSI::NativeReactNativeMatrixSdkSpecJSI(const ObjCTurboModule::InitParams &params)
        : ObjCTurboModule(params), callInvoker(params.jsInvoker) {
            this->methodMap_["installRustCrate"] = MethodMetadata {1, __hostFunction_ReactNativeMatrixSdk_installRustCrate};
            this->methodMap_["cleanupRustCrate"] = MethodMetadata {1, __hostFunction_ReactNativeMatrixSdk_cleanupRustCrate};
    }
} // namespace uniffi_generated

@implementation ReactNativeMatrixSdk
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED

// Automated testing checks unomed_reactnativematrixsdk
// by comparing the whole line here.
/*
- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(unomed_reactnativematrixsdk::multiply(a, b));
}
*/

- (NSNumber *)installRustCrate {
    @throw [NSException exceptionWithName:@"UnreachableException"
                        reason:@"This method should never be called."
                        userInfo:nil];
}

- (NSNumber *)cleanupRustCrate {
    @throw [NSException exceptionWithName:@"UnreachableException"
                        reason:@"This method should never be called."
                        userInfo:nil];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<uniffi_generated::NativeReactNativeMatrixSdkSpecJSI>(params);
}
#endif

@end