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

// MARK: - Keys

private let kSession_accessToken = "accessToken"
private let kSession_refreshToken = "refreshToken"
private let kSession_userId = "userId"
private let kSession_deviceId = "deviceId"
private let kSession_homeserverUrl = "homeserverUrl"
private let kSession_oidcData = "oidcData"
private let kSession_slidingSyncProxy = "slidingSyncProxy"

// MARK: - Stores

private let client_store = ThreadSafeStore<Client>()
private let clientBuilder_store = ThreadSafeStore<ClientBuilder>()
private let ssoHandler_store = ThreadSafeStore<SsoHandler>()

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


    @objc(clientBuilder_username:username:)
    func clientBuilder_username(id: String, username: String) -> String {
        clientBuilder_store.add(clientBuilder_store.remove(id)!.username(username: username))
    }
    
    // MARK: - Session
    
    private func sessionFromDictionary(_ dictionary: [AnyHashable: Any]) -> Session? {
        guard
            let accessToken = dictionary[kSession_accessToken] as? String,
            let userId = dictionary[kSession_userId] as? String,
            let deviceId = dictionary[kSession_deviceId] as? String,
            let homeserverUrl = dictionary[kSession_homeserverUrl] as? String
        else {
            return nil
        }
        return Session(
            accessToken: accessToken,
            refreshToken: dictionary[kSession_refreshToken] as? String,
            userId: userId,
            deviceId: deviceId,
            homeserverUrl: homeserverUrl,
            oidcData: dictionary[kSession_oidcData] as? String,
            slidingSyncProxy: dictionary[kSession_slidingSyncProxy] as? String)
    }
    
    private func sessionToDictionary(_ session: Session) -> [AnyHashable: Any] {
        return [
            kSession_accessToken: session.accessToken,
            kSession_refreshToken: session.refreshToken as Any,
            kSession_userId: session.userId,
            kSession_deviceId: session.deviceId,
            kSession_homeserverUrl: session.homeserverUrl,
            kSession_oidcData: session.oidcData as Any,
            kSession_slidingSyncProxy: session.slidingSyncProxy as Any
        ] as [AnyHashable: Any]
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
