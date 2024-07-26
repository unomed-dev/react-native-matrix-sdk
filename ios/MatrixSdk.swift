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

import Foundation

// MARK: - Events

private let kEvent_roomList_entriesUpdated = "RoomList_entriesUpdated"
private let kEvent_roomListService_stateUpdated = "RoomListService_stateUpdated"

// MARK: - Stores

private let client_store = ThreadSafeStore<Client>()
private let clientBuilder_store = ThreadSafeStore<ClientBuilder>()
private let roomList_store = ThreadSafeStore<RoomList>()
private let roomListEntriesListener_store = ThreadSafeStore<RoomListEntriesListener>()
private let roomListService_store = ThreadSafeStore<RoomListService>()
private let roomListServiceStateListener_store = ThreadSafeStore<RoomListServiceStateListener>()
private let ssoHandler_store = ThreadSafeStore<SsoHandler>()
private let syncServiceBuilder_store = ThreadSafeStore<SyncServiceBuilder>()
private let syncService_store = ThreadSafeStore<SyncService>()
private let taskHandle_store = ThreadSafeStore<TaskHandle>()

extension MatrixSdk {

    // MARK: - Client

    @objc(client_destroy:)
    func client_destroy(id: String) {
        _ = client_store.remove(id)
    }

    @objc(client_displayName:resolve:reject:)
    func client_displayName(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                resolve(try await client_store.get(id)!.displayName())
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    @objc(client_logout:resolve:reject:)
    func client_logout(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                resolve(try await client_store.get(id)!.logout())
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    @objc(client_restoreSession:session:resolve:reject:)
    func client_restoreSession(id: String, session: [AnyHashable: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                try await client_store.get(id)!.restoreSession(session: sessionFromDictionary(session)!)
                resolve(nil)
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    @objc(client_session:)
    func client_session(id: String) -> [AnyHashable: Any] {
        sessionToDictionary(try! client_store.get(id)!.session())
    }

    @objc(client_startSsoLogin:redirectUrl:idpId:resolve:reject:)
    func client_startSsoLogin(id: String, redirectUrl: String, idpId: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                resolve(ssoHandler_store.add(try await client_store.get(id)!.startSsoLogin(redirectUrl: redirectUrl, idpId: idpId)))
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    @objc(client_syncService:)
    func client_syncService(id: String) -> String {
        return syncServiceBuilder_store.add(client_store.get(id)!.syncService())
    }
    
    @objc(client_userId:)
    func client_userId(id: String) -> String {
        try! client_store.get(id)!.userId()
    }

    // MARK: - ClientBuilder

    @objc(clientBuilder_init)
    func clientBuilder_init() -> String {
        clientBuilder_store.add(ClientBuilder())
    }

    @objc(clientBuilder_destroy:)
    func clientBuilder_destroy(id: String) {
        _ = clientBuilder_store.remove(id)
    }
    
    @objc(clientBuilder_build:resolve:reject:)
    func clientBuilder_build(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                resolve(client_store.add(try await clientBuilder_store.get(id)!.build()))
            } catch {
                reject("ERROR", error.localizedDescription, nil)
            }
        }
    }

    @objc(clientBuilder_homeserverUrl:url:)
    func clientBuilder_homeserverUrl(id: String, url: String) -> String {
        clientBuilder_store.add(clientBuilder_store.remove(id)!.homeserverUrl(url: url))
    }

    @objc(clientBuilder_passphrase:passphrase:)
    func clientBuilder_passphrase(id: String, passphrase: String?) -> String {
        clientBuilder_store.add(clientBuilder_store.remove(id)!.passphrase(passphrase: passphrase))
    }

    @objc(clientBuilder_sessionPath:path:)
    func clientBuilder_sessionPath(id: String, path: String) -> String {
        clientBuilder_store.add(clientBuilder_store.remove(id)!.sessionPath(path: path))
    }

    @objc(clientBuilder_slidingSyncProxy:slidingSyncProxy:)
    func clientBuilder_slidingSyncProxy(id: String, slidingSyncProxy: String?) -> String {
        clientBuilder_store.add(clientBuilder_store.remove(id)!.slidingSyncProxy(slidingSyncProxy: slidingSyncProxy))
    }

    @objc(clientBuilder_username:username:)
    func clientBuilder_username(id: String, username: String) -> String {
        clientBuilder_store.add(clientBuilder_store.remove(id)!.username(username: username))
    }

    // MARK: - RoomList

    @objc(roomList_destroy:)
    func roomList_destroy(id: String) {
        _ = roomList_store.remove(id)
    }

    @objc(roomList_entries:listenerId:)
    func roomList_entries(id: String, listenerId: String) -> [AnyHashable: Any] {
        let listener = roomListEntriesListener_store.get(listenerId)!
        let result = roomList_store.get(id)!.entries(listener: listener)
        let entriesStreamId = taskHandle_store.add(result.entriesStream)
        return roomListEntriesResultToDictionary(entries: result.entries, entriesStreamId: entriesStreamId)
    }

    // MARK: - RoomListEntriesListener

    @objc(roomListEntriesListener_init)
    func roomListEntriesListener_init() -> String {
        return roomListEntriesListener_store.add(
            DispatchingRoomListEntriesListener(
                eventName: kEvent_roomList_entriesUpdated,
                eventEmitter: self))
    }

    @objc(roomListEntriesListener_destroy:)
    func roomListEntriesListener_destroy(id: String) {
        _ = roomListEntriesListener_store.remove(id)
    }

    // MARK: - RoomListService

    @objc(roomListService_destroy:)
    func roomListService_destroy(id: String) {
        _ = roomListService_store.remove(id)
    }

    @objc(roomListService_allRooms:resolve:reject:)
    func roomListService_allRooms(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                resolve(roomList_store.add(try await roomListService_store.get(id)!.allRooms()))
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    @objc(roomListService_state:listenerId:)
    func roomListService_state(id: String, listenerId: String) -> String {
        let listener = roomListServiceStateListener_store.get(listenerId)!
        return taskHandle_store.add(roomListService_store.get(id)!.state(listener: listener))
    }

    // MARK: - RoomListServiceStateListener

    @objc(roomListServiceStateListener_init)
    func roomListServiceStateListener_init() -> String {
        return roomListServiceStateListener_store.add(
            DispatchingRoomListServiceStateListener(
                eventName: kEvent_roomListService_stateUpdated,
                eventEmitter: self))
    }

    @objc(roomListServiceStateListener_destroy:)
    func roomListServiceStateListener_destroy(id: String) {
        _ = roomListServiceStateListener_store.remove(id)
    }

    // MARK: - SsoHandler

    @objc(ssoHandler_destroy:)
    func ssoHandler_destroy(id: String) {
        _ = ssoHandler_store.remove(id)
    }

    @objc(ssoHandler_finish:callbackUrl:resolve:reject:)
    func SsoHandler_finish(id: String, callbackUrl: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                try await ssoHandler_store.get(id)!.finish(callbackUrl: callbackUrl)
                resolve(nil)
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    @objc(ssoHandler_url:)
    func SsoHandler_url(id: String) -> String {
        return ssoHandler_store.get(id)!.url()
    }

    // MARK: - SyncService

    @objc(syncService_destroy:)
    func syncService_destroy(id: String) {
        _ = syncService_store.remove(id)
    }

    @objc(syncService_roomListService:)
    func syncService_roomListService(id: String) -> String {
        return roomListService_store.add(syncService_store.get(id)!.roomListService())
    }

    @objc(syncService_start:resolve:reject:)
    func syncService_start(id: String, resolve:  @escaping RCTPromiseResolveBlock, reject:  @escaping RCTPromiseRejectBlock) {
        Task {
            await syncService_store.get(id)!.start()
            resolve(nil)
        }
    }

    @objc(syncService_stop:resolve:reject:)
    func syncService_stop(id: String, resolve:  @escaping RCTPromiseResolveBlock, reject:  @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                try await syncService_store.get(id)!.stop()
                resolve(nil)
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    // MARK: - SyncServiceBuilder

    @objc(syncServiceBuilder_destroy:)
    func syncServiceBuilder_destroy(id: String) {
        _ = syncServiceBuilder_store.remove(id)
    }

    @objc(syncServiceBuilder_finish:resolve:reject:)
    func syncServiceBuilder_finish(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                resolve(syncService_store.add(try await syncServiceBuilder_store.get(id)!.finish()))
            } catch {
                reject("ERROR", error.localizedDescription, nil)
                return
            }
        }
    }

    // MARK: - TaskHandle

    @objc(taskHandle_destroy:)
    func taskHandle_destroy(id: String) {
        _ = taskHandle_store.remove(id)
    }

    @objc(taskHandle_cancel:)
    func taskHandle_cancel(id: String) {
        taskHandle_store.get(id)!.cancel()
    }

    @objc(taskHandle_isFinished:)
    func taskHandle_isFinished(id: String) -> Bool {
        return taskHandle_store.get(id)!.isFinished()
    }

    // MARK: - Event Handling

    @objc(supportedEvents)
    override open func supportedEvents() -> [String] {
        return [
            kEvent_roomList_entriesUpdated,
            kEvent_roomListService_stateUpdated
        ]
    }

    // MARK: - Misc

    @objc(createRandomSessionDirectory)
    func createRandomSessionDirectory() -> String {
        let directory = (sessionBaseDirectory() as NSString).appendingPathComponent(UUID().uuidString)
        try! FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
        return directory
    }

    @objc(sessionBaseDirectory)
    func sessionBaseDirectory() -> String {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!.appendingPathComponent("Sessions").path
    }
}
