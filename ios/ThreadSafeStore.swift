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

/// A thread-safe dictionary store for generic types
class ThreadSafeStore<T> {
    private let queue = DispatchQueue(label: "com.unomed.store.\(T.self)", attributes: .concurrent)
    private var store = [String: T]()

    /// Reads a value from the store
    func get(key: String) -> T? {
        return queue.sync { store[key] }
    }

    /// Adds a new value to the store and returns its key
    func add(_ value: T) -> String {
        return queue.sync(flags: .barrier) {
            let key = generateKey()
            store[key] = value
            return key
        }
    }

    /// Generates an unused key in the store. MUST be called on the queue.
    private func generateKey() -> String {
        var key: String? = nil
        while (key == nil || store[key!] != nil) {
            key = UUID().uuidString
        }
        return key!
    }

    /// Removes a key from the store and returns its value if any
    func remove(_ key: String) -> T? {
        return queue.sync(flags: .barrier) {
            store.removeValue(forKey: key)
        }
    }
}
