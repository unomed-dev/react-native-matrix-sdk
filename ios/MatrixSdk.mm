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

// MARK: - Client

- (void)client_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)client_displayName:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)client_logout:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)client_restoreSession:(NSString *)id session:(NSDictionary *)session resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSDictionary *)client_session:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)client_startSsoLogin:(NSString *)id redirectUrl:(NSString *)redirectUrl idpId:(NSString * _Nullable)idpId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)client_syncService:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)client_userId:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - ClientBuilder

- (NSString *)clientBuilder_init {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)clientBuilder_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)clientBuilder_build:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)clientBuilder_homeserverUrl:(NSString *)id url:(NSString *)url {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)clientBuilder_passphrase:(NSString *)id passphrase:(NSString * _Nullable)passphrase {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)clientBuilder_sessionPath:(NSString *)id path:(NSString *)path {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)clientBuilder_slidingSyncProxy:(NSString *)id slidingSyncProxy:(NSString * _Nullable)slidingSyncProxy {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)clientBuilder_username:(NSString *)id username:(NSString *)username {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - RoomList

- (void)roomList_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSDictionary *)roomList_entries:(NSString *)id listenerId:(NSString *)listenerId {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - RoomListEntriesListener

- (NSString *)roomListEntriesListener_init {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)roomListEntriesListener_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - RoomListService

- (void)roomListService_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)roomListService_allRooms:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)roomListService_state:(NSString *)id listenerId:(NSString *)listenerId {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - RoomListServiceStateListener

- (NSString *)roomListServiceStateListener_init {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)roomListServiceStateListener_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - SsoHandler

- (void)ssoHandler_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)ssoHandler_finish:(NSString *)id callbackUrl:(NSString *)callbackUrl resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)ssoHandler_url:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - SyncService

- (void)syncService_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)syncService_roomListService:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}


- (void)syncService_start:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}


- (void)syncService_stop:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - SyncServiceBuilder

- (void)syncServiceBuilder_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}


- (void)syncServiceBuilder_finish:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - TaskHandle

- (void)taskHandle_destroy:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (void)taskHandle_cancel:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSNumber *)taskHandle_isFinished:(NSString *)id {
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

// MARK: - Misc

- (NSString *)createRandomSessionDirectory { 
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

- (NSString *)sessionBaseDirectory { 
    @throw [NSException exceptionWithName:@"Implemented in Swift" reason:nil userInfo:nil];
}

#endif

@end
