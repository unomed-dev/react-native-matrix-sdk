package com.matrixsdk

import java.util.UUID
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write

class ThreadSafeStore<T> {
  private val lock = ReentrantReadWriteLock()
  private val store = HashMap<String, T>()

  /// Reads a value from the store
  fun get(key: String): T? {
    return lock.read { store[key] }
  }

  /// Adds a new value to the store and returns its key
  fun add(value: T): String {
    return lock.write {
      val key = generateKey()
      store[key] = value
      key
    }
  }

  /// Generates an unused key in the store. MUST be called after locking the store.
  private fun generateKey(): String {
    var key: String? = null
    while (key == null || store.containsKey(key)) {
      key = UUID.randomUUID().toString()
    }
    return key
  }

  /// Removes a key from the store and returns its value if any
  fun remove(key: String): T? {
    return lock.write {
      store.remove(key)
    }
  }
}
