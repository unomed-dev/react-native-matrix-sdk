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

package com.matrixsdk

import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.matrix.rustcomponents.sdk.RoomListServiceState
import org.matrix.rustcomponents.sdk.RoomListServiceStateListener

private const val kState = "state"

class RoomListServiceStateEventDispatcher: RoomListServiceStateListener {
  private val eventName: String
  private val eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter

  constructor(eventName: String, eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter) {
    this.eventName = eventName
    this.eventEmitter = eventEmitter
  }

  override fun onUpdate(state: RoomListServiceState) {
    eventEmitter.emit(eventName, Arguments.createMap().apply {
      putString(kState, roomListServiceStateToString(state))
    })
  }
}
