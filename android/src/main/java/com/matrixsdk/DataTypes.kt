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
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import org.matrix.rustcomponents.sdk.RoomListEntriesUpdate
import org.matrix.rustcomponents.sdk.RoomListServiceState
import org.matrix.rustcomponents.sdk.Session
import org.matrix.rustcomponents.sdk.SlidingSyncVersion
import org.matrix.rustcomponents.sdk.SlidingSyncVersionBuilder

// region RoomListEntriesUpdate

private const val kRoomListEntriesUpdate_index = "index"
private const val kRoomListEntriesUpdate_length = "length"
private const val kRoomListEntriesUpdate_type = "type"
private const val kRoomListEntriesUpdate_value = "value"
private const val kRoomListEntriesUpdate_values = "values"

fun roomListEntriesUpdateToMap(update: RoomListEntriesUpdate): WritableMap {
  return when (update) {
    is RoomListEntriesUpdate.Append -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "append")
      putArray(kRoomListEntriesUpdate_values, Arguments.createArray().apply { update.values.forEach { pushString(it.id()) } })
    }
    is RoomListEntriesUpdate.Clear -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "clear")
    }
    is RoomListEntriesUpdate.PushFront -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "pushFront")
      putString(kRoomListEntriesUpdate_value, update.value.id())
    }
    is RoomListEntriesUpdate.PushBack -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "pushBack")
      putString(kRoomListEntriesUpdate_value, update.value.id())
    }
    is RoomListEntriesUpdate.PopFront -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "popFront")
    }
    is RoomListEntriesUpdate.PopBack -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "popBack")
    }
    is RoomListEntriesUpdate.Insert -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "insert")
      putInt(kRoomListEntriesUpdate_index, update.index.toInt())
      putString(kRoomListEntriesUpdate_value, update.value.id())
    }
    is RoomListEntriesUpdate.Set -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "set")
      putInt(kRoomListEntriesUpdate_index, update.index.toInt())
      putString(kRoomListEntriesUpdate_value, update.value.id())
    }
    is RoomListEntriesUpdate.Remove -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "remove")
      putInt(kRoomListEntriesUpdate_index, update.index.toInt())
    }
    is RoomListEntriesUpdate.Truncate -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "truncate")
      putInt(kRoomListEntriesUpdate_length, update.length.toInt())
    }
    is RoomListEntriesUpdate.Reset -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "reset")
      putArray(kRoomListEntriesUpdate_values, Arguments.createArray().apply { update.values.forEach { pushString(it.id()) } })
    }
  }
}

// endregion

// region RoomListServiceState

fun roomListServiceStateToString(state: RoomListServiceState): String {
  return when (state) {
    RoomListServiceState.INITIAL -> "initial"
    RoomListServiceState.SETTING_UP -> "settingUp"
    RoomListServiceState.RECOVERING -> "recovering"
    RoomListServiceState.RUNNING -> "running"
    RoomListServiceState.ERROR -> "error"
    RoomListServiceState.TERMINATED -> "terminated"
  }
}

// endregion

// region Session

private const val kSession_accessToken = "accessToken"
private const val kSession_refreshToken = "refreshToken"
private const val kSession_userId = "userId"
private const val kSession_deviceId = "deviceId"
private const val kSession_homeserverUrl = "homeserverUrl"
private const val kSession_oidcData = "oidcData"
private const val kSession_slidingSyncVersion = "slidingSyncVersion"

fun sessionFromMap(map: ReadableMap): Session? {
  val accessToken = map.getString(kSession_accessToken)
  val userId = map.getString(kSession_userId)
  val deviceId = map.getString(kSession_deviceId)
  val homeserverUrl = map.getString(kSession_homeserverUrl)
  val slidingSyncVersion = map.getMap(kSession_slidingSyncVersion)
  if (accessToken == null || userId == null || deviceId == null || homeserverUrl == null || slidingSyncVersion == null) {
    return null
  }
  return Session(
    accessToken = accessToken,
    refreshToken = map.getString(kSession_refreshToken),
    userId = userId,
    deviceId = deviceId,
    homeserverUrl = homeserverUrl,
    oidcData = map.getString(kSession_oidcData),
    slidingSyncVersion = slidingSyncVersionFromMap(slidingSyncVersion)!!)
}

fun sessionToMap(session: Session): WritableMap {
  val map = Arguments.createMap()
  map.putString(kSession_accessToken, session.accessToken)
  map.putString(kSession_refreshToken, session.refreshToken)
  map.putString(kSession_userId, session.userId)
  map.putString(kSession_deviceId, session.deviceId)
  map.putString(kSession_homeserverUrl, session.homeserverUrl)
  map.putString(kSession_oidcData, session.oidcData)
  map.putMap(kSession_slidingSyncVersion, slidingSyncVersionToMap(session.slidingSyncVersion))
  return map
}

// endregion

// region SlidingSyncVersion

// MARK: - SlidingSyncVersion

private const val kSlidingSyncVersion_type = "type"
private const val kSlidingSyncVersion_type_none = "none"
private const val kSlidingSyncVersion_type_proxy = "proxy"
private const val kSlidingSyncVersion_type_native = "native"
private const val kSlidingSyncVersion_url = "url"

fun slidingSyncVersionFromMap(map: ReadableMap): SlidingSyncVersion? {
  return when (map.getString(kSlidingSyncVersion_type)) {
    kSlidingSyncVersion_type_none -> SlidingSyncVersion.None
    kSlidingSyncVersion_type_proxy -> {
      val url = map.getString(kSlidingSyncVersion_url) ?: return null
      return SlidingSyncVersion.Proxy(url)
    }
    kSlidingSyncVersion_type_native -> SlidingSyncVersion.Native
    else -> null
  }
}

fun slidingSyncVersionToMap(version: SlidingSyncVersion): WritableMap {
  return when (version) {
    is SlidingSyncVersion.None -> Arguments.createMap().apply {
      putString(kSlidingSyncVersion_type, kSlidingSyncVersion_type_none)
    }
    is SlidingSyncVersion.Proxy ->Arguments.createMap().apply {
      putString(kSlidingSyncVersion_type, kSlidingSyncVersion_type_proxy)
      putString(kSlidingSyncVersion_url, version.url)
    }
    is SlidingSyncVersion.Native -> Arguments.createMap().apply {
      putString(kSlidingSyncVersion_type, kSlidingSyncVersion_type_native)
    }
  }
}

// endregion

// region SlidingSyncVersionBuilder

private const val kSlidingSyncVersionBuilder_type = "type"
private const val kSlidingSyncVersionBuilder_url = "url"

fun slidingSyncVersionBuilderFromMap(map: ReadableMap): SlidingSyncVersionBuilder? {
  return when (map.getString(kSlidingSyncVersionBuilder_type)) {
    "none" -> SlidingSyncVersionBuilder.None
    "proxy" -> {
      val url = map.getString(kSlidingSyncVersionBuilder_url) ?: return null
      return SlidingSyncVersionBuilder.Proxy(url)
    }
    "native" -> SlidingSyncVersionBuilder.Native
    "discoverProxy" -> SlidingSyncVersionBuilder.DiscoverProxy
    "discoverNative" -> SlidingSyncVersionBuilder.DiscoverNative
    else -> null
  }
}

// endregion
