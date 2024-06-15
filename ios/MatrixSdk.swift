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
import matrix_sdkFFI

private let authenticationService_store = ThreadSafeStore<AuthenticationService>()

extension MatrixSdk {
    @objc(authenticationService_init:passphrase:userAgent:)
    func authenticationService_init(basePath: String, passphrase: String, userAgent: String) -> String {
        return authenticationService_store.add(AuthenticationService(sessionPath: basePath, passphrase: passphrase, userAgent: userAgent, additionalRootCertificates: [], proxy: nil, oidcConfiguration: nil, customSlidingSyncProxy: nil, sessionDelegate: nil, crossProcessRefreshLockId: nil))
    }

    @objc(authenticationService_destroy:)
    func authenticationService_destroy(id: String) {
        _ = authenticationService_store.remove(id)
    }
}
