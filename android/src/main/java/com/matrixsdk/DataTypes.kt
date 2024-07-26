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
import org.matrix.rustcomponents.sdk.RoomListEntry
import org.matrix.rustcomponents.sdk.RoomListServiceState
import org.matrix.rustcomponents.sdk.Session

// region RoomListEntry

private const val kRoomListEntry_type = "type"
private const val kRoomListEntry_roomId = "roomId"

fun roomListEntryToMap(entry: RoomListEntry): WritableMap {
  return when (entry) {
    is RoomListEntry.Empty -> Arguments.createMap().apply {
      putString(kRoomListEntry_type, "empty")
    }
    is RoomListEntry.Invalidated -> Arguments.createMap().apply {
      putString(kRoomListEntry_type, "invalidated")
      putString(kRoomListEntry_roomId, entry.roomId)
    }
    is RoomListEntry.Filled -> Arguments.createMap().apply {
      putString(kRoomListEntry_type, "filled")
      putString(kRoomListEntry_roomId, entry.roomId)
    }
  }
}

// endregion

// region RoomListEntriesResult

fun roomListEntriesResultToMap(entries: List<RoomListEntry>, entriesStreamId: String): WritableMap {
  return Arguments.createMap().apply {
    putArray("entries", Arguments.createArray().apply { entries.forEach { pushMap(roomListEntryToMap(it)) } })
    putString("entriesStreamId", entriesStreamId)
  }
}

// endregion

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
      putArray(kRoomListEntriesUpdate_values, Arguments.createArray().apply { update.values.forEach { pushMap(roomListEntryToMap(it)) } })
    }
    is RoomListEntriesUpdate.Clear -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "clear")
    }
    is RoomListEntriesUpdate.PushFront -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "pushFront")
      putMap(kRoomListEntriesUpdate_value, roomListEntryToMap(update.value))
    }
    is RoomListEntriesUpdate.PushBack -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "pushBack")
      putMap(kRoomListEntriesUpdate_value, roomListEntryToMap(update.value))
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
      putMap(kRoomListEntriesUpdate_value, roomListEntryToMap(update.value))
    }
    is RoomListEntriesUpdate.Set -> Arguments.createMap().apply {
      putString(kRoomListEntriesUpdate_type, "set")
      putInt(kRoomListEntriesUpdate_index, update.index.toInt())
      putMap(kRoomListEntriesUpdate_value, roomListEntryToMap(update.value))
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
      putArray(kRoomListEntriesUpdate_values, Arguments.createArray().apply { update.values.forEach { pushMap(roomListEntryToMap(it)) } })
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
private const val kSession_slidingSyncProxy = "slidingSyncProxy"

fun sessionFromMap(map: ReadableMap): Session? {
  val accessToken = map.getString(kSession_accessToken)
  val userId = map.getString(kSession_userId)
  val deviceId = map.getString(kSession_deviceId)
  val homeserverUrl = map.getString(kSession_homeserverUrl)
  if (accessToken == null || userId == null || deviceId == null || homeserverUrl == null) {
    return null
  }
  return Session(
    accessToken = accessToken,
    refreshToken = map.getString(kSession_refreshToken),
    userId = userId,
    deviceId = deviceId,
    homeserverUrl = homeserverUrl,
    oidcData = map.getString(kSession_oidcData),
    slidingSyncProxy = map.getString(kSession_slidingSyncProxy))
}

fun sessionToMap(session: Session): WritableMap {
  val map = Arguments.createMap()
  map.putString(kSession_accessToken, session.accessToken)
  map.putString(kSession_refreshToken, session.refreshToken)
  map.putString(kSession_userId, session.userId)
  map.putString(kSession_deviceId, session.deviceId)
  map.putString(kSession_homeserverUrl, session.homeserverUrl)
  map.putString(kSession_oidcData, session.oidcData)
  map.putString(kSession_slidingSyncProxy, session.slidingSyncProxy)
  return map
}

// endregion
