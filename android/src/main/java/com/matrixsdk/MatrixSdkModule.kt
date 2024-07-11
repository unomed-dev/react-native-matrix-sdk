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
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.matrix.rustcomponents.sdk.Client
import org.matrix.rustcomponents.sdk.ClientBuildException
import org.matrix.rustcomponents.sdk.ClientBuilder
import org.matrix.rustcomponents.sdk.ClientException
import org.matrix.rustcomponents.sdk.Session
import org.matrix.rustcomponents.sdk.SsoException
import org.matrix.rustcomponents.sdk.SsoHandler
import java.io.File
import java.util.UUID

// region Keys

private const val kSession_accessToken = "accessToken"
private const val kSession_refreshToken = "refreshToken"
private const val kSession_userId = "userId"
private const val kSession_deviceId = "deviceId"
private const val kSession_homeserverUrl = "homeserverUrl"
private const val kSession_oidcData = "oidcData"
private const val kSession_slidingSyncProxy = "slidingSyncProxy"

// endregion

// region Stores

private val client_store = ThreadSafeStore<Client>()
private val clientBuilder_store = ThreadSafeStore<ClientBuilder>()
private val ssoHandler_store = ThreadSafeStore<SsoHandler>()

// endregion

@ReactModule(name = MatrixSdkModule.NAME)
class MatrixSdkModule : NativeMatrixSdkSpec {

  companion object {
    const val NAME = "MatrixSdk"
  }

  private val applicationContext: Context

  constructor(reactContext: ReactApplicationContext) : super(reactContext) {
    applicationContext = reactContext.applicationContext
  }

  override fun getName(): String {
    return NAME
  }

  // region Client

  override fun client_destroy(id: String) {
    client_store.remove(id)
  }

  override fun client_displayName(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.get(id)!!.displayName())
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

  override fun client_logout(id: String, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(client_store.get(id)!!.logout())
      } catch (e: ClientException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
  }

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

  override fun client_startSsoLogin(id: String, redirectUrl: String, idpId: String?, promise: Promise) {
    GlobalScope.launch {
      try {
        promise.resolve(ssoHandler_store.add(client_store.get(id)!!.startSsoLogin(redirectUrl, idpId)))
      } catch (e: SsoException) {
        promise.reject("ERROR", e.localizedMessage, null)
      }
    }
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

  override fun clientBuilder_username(id: String, username: String): String {
    return clientBuilder_store.add(clientBuilder_store.remove(id)!!.username(username))
  }

  // endregion

  // region Session

  private fun sessionFromMap(map: ReadableMap): Session? {
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

  private fun sessionToMap(session: Session): WritableMap {
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

  // region SsoHandler

  override fun ssoHandler_destroy(id: String) {
    ssoHandler_store.remove(id)
  }

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
