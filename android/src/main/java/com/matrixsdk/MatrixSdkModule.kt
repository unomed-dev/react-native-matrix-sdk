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

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import org.matrix.rustcomponents.sdk.AuthenticationService

private val authenticationService_store = ThreadSafeStore<AuthenticationService>()

@ReactModule(name = MatrixSdkModule.NAME)
class MatrixSdkModule(reactContext: ReactApplicationContext) :
  NativeMatrixSdkSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "MatrixSdk"
  }

  override fun authenticationService_init(basePath: String, passphrase: String?, userAgent: String?): String {
    return authenticationService_store.add(AuthenticationService(basePath, passphrase, userAgent, emptyList(), null, null, null, null, null))
  }

  override fun authenticationService_destroy(id: String) {
    authenticationService_store.remove(id)
  }
}
