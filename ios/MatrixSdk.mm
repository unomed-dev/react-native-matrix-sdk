// Copyright 2024 Unomed AG
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import "MatrixSdk.h"

@implementation MatrixSdk
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMatrixSdkSpecJSI>(params);
}

- (NSString *)authenticationService_init:(NSString *)basePath passphrase:(NSString * _Nullable)passphrase userAgent:(NSString * _Nullable)userAgent {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)authenticationService_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

#endif

@end
