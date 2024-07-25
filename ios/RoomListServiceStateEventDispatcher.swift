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

private let kState = "state"

/// Dispatches events for RoomListService state updates
final class RoomListServiceStateEventDispatcher: RoomListServiceStateListener {
    private let eventName: String
    private let eventEmitter: RCTEventEmitter

    init(eventName: String, eventEmitter: RCTEventEmitter) {
        self.eventName = eventName
        self.eventEmitter = eventEmitter
    }

    func onUpdate(state: RoomListServiceState) {
        eventEmitter.sendEvent(withName: eventName, body: [kState: roomListServiceStateToString(state)])
    }
}
