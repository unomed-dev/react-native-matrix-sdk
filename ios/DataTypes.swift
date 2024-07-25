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

// MARK: - RoomListServiceState

func roomListServiceStateToString(_ state: RoomListServiceState) -> String {
    switch state {
    case .initial:
        return "initial"
    case .settingUp:
        return "settingUp"
    case .recovering:
        return "recovering"
    case .running:
        return "running"
    case .error:
        return "error"
    case .terminated:
        return "terminated"
    }
}

// MARK: - Session

private let kSession_accessToken = "accessToken"
private let kSession_refreshToken = "refreshToken"
private let kSession_userId = "userId"
private let kSession_deviceId = "deviceId"
private let kSession_homeserverUrl = "homeserverUrl"
private let kSession_oidcData = "oidcData"
private let kSession_slidingSyncProxy = "slidingSyncProxy"

func sessionFromDictionary(_ dictionary: [AnyHashable: Any]) -> Session? {
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

func sessionToDictionary(_ session: Session) -> [AnyHashable: Any] {
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
