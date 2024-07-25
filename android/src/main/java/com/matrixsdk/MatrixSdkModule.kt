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
import org.matrix.rustcomponents.sdk.RoomListService
import org.matrix.rustcomponents.sdk.SsoException
import org.matrix.rustcomponents.sdk.SsoHandler
import org.matrix.rustcomponents.sdk.SyncService
import org.matrix.rustcomponents.sdk.SyncServiceBuilder
import org.matrix.rustcomponents.sdk.TaskHandle
import java.io.File
import java.util.UUID

// region Events

private const val kEvent_RoomListService_stateUpdated = "RoomListService_stateUpdated"

// endregion

// region Stores

private val client_store = ThreadSafeStore<Client>()
private val clientBuilder_store = ThreadSafeStore<ClientBuilder>()
private val roomListService_store = ThreadSafeStore<RoomListService>()
private val roomListServiceStateEventDispatcher_store = ThreadSafeStore<RoomListServiceStateEventDispatcher>()
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

  @DelicateCoroutinesApi
  override fun client_displayName(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.get(id)!!.displayName())
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  @DelicateCoroutinesApi
  override fun client_logout(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.get(id)!!.logout())
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  @DelicateCoroutinesApi
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

  @DelicateCoroutinesApi
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

  @DelicateCoroutinesApi
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

  override fun clientBuilder_sessionPath(id: String, path: String): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.sessionPath(path))
  }

  override fun clientBuilder_slidingSyncProxy(id: String, slidingSyncProxy: String?): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.slidingSyncProxy(slidingSyncProxy))
  }

  override fun clientBuilder_username(id: String, username: String): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.username(username))
  }

  // endregion

  // region RoomListService

  override fun roomListService_destroy(id: String) {
    roomListService_store.remove(id)
  }

  override fun roomListService_state(id: String, dispatcherId: String) {
    val dispatcher = roomListServiceStateEventDispatcher_store.get(dispatcherId)!!
    taskHandle_store.add(roomListService_store.get(id)!!.state(dispatcher), dispatcherId)
  }

  // endregion

  // region RoomListServiceStateEventDispatcher

  override fun roomListServiceStateEventDispatcher_init(): String {
    return roomListServiceStateEventDispatcher_store.add(
      RoomListServiceStateEventDispatcher(kEvent_RoomListService_stateUpdated, eventEmitter))
  }

  override fun roomListServiceStateEventDispatcher_destroy(id: String) {
    taskHandle_store.get(id)?.cancel()
    taskHandle_store.remove(id)
    roomListServiceStateEventDispatcher_store.remove(id)
  }

  // endregion

  // region SsoHandler

  override fun ssoHandler_destroy(id: String) {
    ssoHandler_store.remove(id)
  }

  @DelicateCoroutinesApi
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

  // region SyncServiceBuilder

  override fun syncServiceBuilder_destroy(id: String) {
    syncServiceBuilder_store.remove(id)
  }

  @DelicateCoroutinesApi
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

  // region SyncService

  override fun syncService_destroy(id: String) {
    syncService_store.remove(id)
  }

  override fun syncService_roomListService(id: String): String {
    return roomListService_store.add(syncService_store.get(id)!!.roomListService())
  }

  @DelicateCoroutinesApi
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

  @DelicateCoroutinesApi
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
