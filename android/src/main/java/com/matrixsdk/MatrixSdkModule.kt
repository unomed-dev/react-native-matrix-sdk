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

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.matrix.rustcomponents.sdk.Client
import org.matrix.rustcomponents.sdk.ClientBuildException
import org.matrix.rustcomponents.sdk.ClientBuilder
import org.matrix.rustcomponents.sdk.ClientException
import org.matrix.rustcomponents.sdk.EventTimelineItem
import org.matrix.rustcomponents.sdk.RoomList
import org.matrix.rustcomponents.sdk.RoomListEntriesListener
import org.matrix.rustcomponents.sdk.RoomListException
import org.matrix.rustcomponents.sdk.RoomListItem
import org.matrix.rustcomponents.sdk.RoomListService
import org.matrix.rustcomponents.sdk.RoomListServiceStateListener
import org.matrix.rustcomponents.sdk.SsoException
import org.matrix.rustcomponents.sdk.SsoHandler
import org.matrix.rustcomponents.sdk.SyncService
import org.matrix.rustcomponents.sdk.SyncServiceBuilder
import org.matrix.rustcomponents.sdk.TaskHandle
import java.io.File
import java.util.UUID

// region Events

private const val kEvent_roomList_entriesUpdated = "RoomList_entriesUpdated"
private const val kEvent_roomListService_stateUpdated = "RoomListService_stateUpdated"

// endregion

// region Stores

private val client_store = ThreadSafeStore<Client>()
private val clientBuilder_store = ThreadSafeStore<ClientBuilder>()
private val eventTimelineItem_store = ThreadSafeStore<EventTimelineItem>()
private val roomList_store = ThreadSafeStore<RoomList>()
private val roomListEntriesListener_store = ThreadSafeStore<RoomListEntriesListener>()
private val roomListItem_store = ThreadSafeStore<RoomListItem>()
private val roomListService_store = ThreadSafeStore<RoomListService>()
private val roomListServiceStateListener_store = ThreadSafeStore<RoomListServiceStateListener>()
private val ssoHandler_store = ThreadSafeStore<SsoHandler>()
private val syncServiceBuilder_store = ThreadSafeStore<SyncServiceBuilder>()
private val syncService_store = ThreadSafeStore<SyncService>()
private val taskHandle_store = ThreadSafeStore<TaskHandle>()

// endregion

@ReactModule(name = MatrixSdkModule.NAME)
class MatrixSdkModule : NativeMatrixSdkSpec {

  companion object {
    const val NAME = "MatrixSdk"
  }

  private val applicationContext: Context
  private val eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter

  constructor(reactContext: ReactApplicationContext) : super(reactContext) {
    applicationContext = reactContext.applicationContext
    eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
  }

  override fun getName(): String {
    return NAME
  }

  // region Client

  override fun client_destroy(id: String) {
    client_store.remove(id)
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun client_displayName(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.get(id)!!.displayName())
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun client_logout(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.get(id)!!.logout())
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun client_restoreSession(id: String, session: ReadableMap, promise: Promise) {
    GlobalScope.launch {
      try {
        client_store.get(id)!!.restoreSession(sessionFromMap(session)!!)
        promise.resolve(null)
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun client_session(id: String): WritableMap {
    return sessionToMap(client_store.get(id)!!.session())
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun client_startSsoLogin(id: String, redirectUrl: String, idpId: String?, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(ssoHandler_store.add(client_store.get(id)!!.startSsoLogin(redirectUrl, idpId)))
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun client_syncService(id: String): String {
    return syncServiceBuilder_store.add(client_store.get(id)!!.syncService())
  }

  override fun client_userId(id: String): String {
    return client_store.get(id)!!.userId()
  }

  // endregion

  // region ClientBuilder

  override fun clientBuilder_init(): String {
    return clientBuilder_store.add(ClientBuilder())
  }

  override fun clientBuilder_destroy(id: String) {
    clientBuilder_store.remove(id)
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun clientBuilder_build(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.add(clientBuilder_store.get(id)!!.build()))
      } catch (e: ClientBuildException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun clientBuilder_homeserverUrl(id: String, url: String): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.homeserverUrl(url))
  }

  override fun clientBuilder_passphrase(id: String, passphrase: String?): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.passphrase(passphrase))
  }

  override fun clientBuilder_sessionPaths(id: String, dataPath: String, cachePath: String): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.sessionPaths(dataPath, cachePath))
  }

  override fun clientBuilder_slidingSyncVersionBuilder(id: String, versionBuilder: ReadableMap): String {
    return clientBuilder_store.add(
      clientBuilder_store.remove(id)!!.slidingSyncVersionBuilder(
        slidingSyncVersionBuilderFromMap(versionBuilder)!!))
  }

  override fun clientBuilder_username(id: String, username: String): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.username(username))
  }

  // endregion

  // region EventTimelineItem

  override fun eventTimelineItem_destroy(id: String) {
    eventTimelineItem_store.remove(id)
  }

  override fun eventTimelineItem_timestamp(id: String): Double {
    return eventTimelineItem_store.get(id)!!.timestamp().toDouble()
  }

  // endregion

  // region RoomList

  override fun roomList_destroy(id: String) {
    roomList_store.remove(id)
  }

  override fun roomList_entries(id: String, listenerId: String): String {
    val listener = roomListEntriesListener_store.get(listenerId)!!
    return taskHandle_store.add(roomList_store.get(id)!!.entries(listener))
  }

  // endregion

  // region RoomListEntriesListener

  override fun roomListEntriesListener_init(): String {
    return roomListEntriesListener_store.add(
      DispatchingRoomListEntriesListener(kEvent_roomList_entriesUpdated, eventEmitter))
  }

  override fun roomListEntriesListener_destroy(id: String) {
    roomListEntriesListener_store.remove(id)
  }

  // endregion

  // region RoomListItem

  override fun roomListItem_destroy(id: String) {
    roomListItem_store.remove(id)
  }

  override fun roomListItem_avatarUrl(id: String): String? {
    return roomListItem_store.get(id)!!.avatarUrl()
  }

  override fun roomListItem_displayName(id: String): String? {
    return roomListItem_store.get(id)!!.displayName()
  }

  override fun roomListItem_id(id: String): String {
    return roomListItem_store.get(id)!!.id()
  }

  override fun roomListItem_initTimeline(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        roomListItem_store.get(id)!!.initTimeline(null, null)
        promise.resolve(null)
      } catch (e: RoomListException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun roomListItem_isTimelineInitialized(id: String): Boolean {
    return roomListItem_store.get(id)!!.isTimelineInitialized()
  }

  override fun roomListItem_latestEvent(id: String, promise: Promise) {
    GlobalScope.launch {
      val eventTimelineItem = roomListItem_store.get(id)!!.latestEvent()
      if (eventTimelineItem != null) {
        promise.resolve(eventTimelineItem_store.add(eventTimelineItem))
      } else {
        promise.resolve(null)
      }
    }
  }

  // endregion

  // region RoomListService

  override fun roomListService_destroy(id: String) {
    roomListService_store.remove(id)
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun roomListService_allRooms(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(roomList_store.add(roomListService_store.get(id)!!.allRooms()))
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun roomListService_room(id: String, roomId: String): String {
    return roomListItem_store.add(roomListService_store.get(id)!!.room(roomId))
  }

  override fun roomListService_state(id: String, listenerId: String): String {
    val listener = roomListServiceStateListener_store.get(listenerId)!!
    return taskHandle_store.add(roomListService_store.get(id)!!.state(listener))
  }

  // endregion

  // region RoomListServiceStateListener

  override fun roomListServiceStateListener_init(): String {
    return roomListServiceStateListener_store.add(
      DispatchingRoomListServiceStateListener(kEvent_roomListService_stateUpdated, eventEmitter))
  }

  override fun roomListServiceStateListener_destroy(id: String) {
    roomListServiceStateListener_store.remove(id)
  }

  // endregion

  // region SsoHandler

  override fun ssoHandler_destroy(id: String) {
    ssoHandler_store.remove(id)
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun ssoHandler_finish(id: String, callbackUrl: String, promise: Promise) {
    GlobalScope.launch {
      try {
        ssoHandler_store.get(id)!!.finish(callbackUrl)
        promise.resolve(null)
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun ssoHandler_url(id: String): String {
    return ssoHandler_store.get(id)!!.url()
  }

  // endregion

  // region SyncService

  override fun syncService_destroy(id: String) {
    syncService_store.remove(id)
  }

  override fun syncService_roomListService(id: String): String {
    return roomListService_store.add(syncService_store.get(id)!!.roomListService())
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun syncService_start(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        syncService_store.get(id)!!.start()
        promise.resolve(null)
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun syncService_stop(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        syncService_store.get(id)!!.stop()
        promise.resolve(null)
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  // endregion

  // region SyncServiceBuilder

  override fun syncServiceBuilder_destroy(id: String) {
    syncServiceBuilder_store.remove(id)
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun syncServiceBuilder_finish(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(syncService_store.add(syncServiceBuilder_store.get(id)!!.finish()))
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  // endregion

  // region TaskHandle
  override fun taskHandle_destroy(id: String) {
    taskHandle_store.remove(id)
  }

  override fun taskHandle_cancel(id: String) {
    taskHandle_store.get(id)!!.cancel()
  }

  override fun taskHandle_isFinished(id: String): Boolean {
    return taskHandle_store.get(id)!!.isFinished()
  }

  // endregion

  // region Event Handling

  override fun addListener(eventType: String) {}

  override fun removeListeners(count: Double) {}

  // endregion

  // region Misc

  override fun createRandomSessionDirectory(): String {
    val directory = File(sessionBaseDirectory(), UUID.randomUUID().toString())
    directory.mkdirs()
    return directory.absolutePath
  }

  override fun sessionBaseDirectory(): String {
    return File(applicationContext.filesDir, "sessions").absolutePath
  }

  // endregion
}
