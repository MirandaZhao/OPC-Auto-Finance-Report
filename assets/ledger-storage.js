/* Local ledger persistence. No network requests; keep the same app location/browser.
 * load() -> project|null; save(project) -> {saved,backend,savedAt}; clear() -> void.
 * A save snapshots its argument immediately and resolves only after the write commits.
 * Callers must show a failure and offer a downloaded backup when a promise rejects.
 */
(function (root) {
  'use strict';
  // The public release starts in its own namespace. Older preview ledgers
  // are neither loaded, migrated nor deleted by this application version.
  const KEY = 'youshu-ledger-v2', STORE = 'projects', RECORD = 'current';
  let backendPromise = null, queue = Promise.resolve(), lastSavedTime = 0;

  function failure(code, message, cause) {
    return Object.assign(new Error(message), {code, cause});
  }
  function storageError(cause) {
    if (cause?.code && String(cause.code).startsWith('STORAGE_')) return cause;
    const quota = cause?.name === 'QuotaExceededError' || cause?.name === 'NS_ERROR_DOM_QUOTA_REACHED';
    return failure(quota ? 'STORAGE_FULL' : 'STORAGE_UNAVAILABLE', quota
      ? '本机保存空间不足，数据尚未自动保存。请先下载账本备份，再腾出浏览器空间。'
      : '当前浏览器无法保存账本。请下载账本备份，避免关闭后丢失数据。', cause);
  }
  function serialize(project) {
    if (!project || typeof project !== 'object' || Array.isArray(project)) throw failure('STORAGE_INVALID', '账本内容无效，无法保存。');
    try {
      const json = JSON.stringify(project);
      if (!json || json === 'null') throw new Error('Empty project');
      return JSON.parse(json);
    } catch (error) { throw failure('STORAGE_INVALID', '账本内容无法保存，请先检查数据。', error); }
  }
  function decode(value) {
    if (value == null) return null;
    try {
      const envelope = typeof value === 'string' ? JSON.parse(value) : value;
      if (envelope?.version !== 1 || !envelope.project || typeof envelope.project !== 'object' || Array.isArray(envelope.project) || !Number.isFinite(Date.parse(envelope.savedAt))) throw new Error('Invalid saved ledger');
      return envelope;
    } catch (error) { throw failure('STORAGE_CORRUPT', '本机保存的账本无法读取，已保留原数据。请使用下载的账本备份恢复。', error); }
  }
  function localStorageObject() {
    try {
      if (!root.localStorage) throw new Error('Storage unavailable');
      return root.localStorage;
    } catch (error) { throw storageError(error); }
  }
  function localBackend() {
    const storage = localStorageObject();
    return {
      name: 'localStorage',
      read: async () => { try { return decode(storage.getItem(KEY)); } catch (error) { throw storageError(error); } },
      write: async envelope => { try { storage.setItem(KEY, JSON.stringify(envelope)); } catch (error) { throw storageError(error); } },
      clear: async () => { try { storage.removeItem(KEY); } catch (error) { throw storageError(error); } }
    };
  }
  function openDatabase() {
    return new Promise((resolve, reject) => {
      let request, settled = false, timer;
      const finish = (error, db) => {
        if (settled) { if (db) db.close(); return; }
        settled = true;
        if (timer) root.clearTimeout(timer);
        if (error) reject(error); else resolve(db);
      };
      try {
        if (!root.indexedDB) throw new Error('IndexedDB unavailable');
        request = root.indexedDB.open(KEY, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        };
        request.onsuccess = () => finish(null, request.result);
        request.onerror = () => finish(request.error || new Error('Could not open database'));
        request.onblocked = () => finish(new Error('Database is blocked'));
        timer = root.setTimeout(() => finish(new Error('Database open timed out')), 4000);
      } catch (error) { finish(error); }
    });
  }
  function indexedBackend(db) {
    db.onversionchange = () => {db.close(); backendPromise = null;};
    function transaction(mode, action) {
      return new Promise((resolve, reject) => {
        let tx, result;
        try {
          tx = db.transaction(STORE, mode);
          tx.oncomplete = () => resolve(result);
          // A request may succeed while its transaction later aborts (e.g. quota).
          tx.onabort = () => reject(storageError(tx.error || new Error('Transaction aborted')));
          tx.onerror = () => {}; // onabort carries the final failure.
          const request = action(tx.objectStore(STORE));
          request.onsuccess = () => {result = request.result;};
        } catch (error) { reject(storageError(error)); }
      });
    }
    return {
      name: 'indexedDB',
      read: async () => decode(await transaction('readonly', store => store.get(RECORD))),
      write: envelope => transaction('readwrite', store => store.put(JSON.stringify(envelope), RECORD)),
      clear: () => transaction('readwrite', store => store.delete(RECORD))
    };
  }
  function backend() {
    if (!backendPromise) backendPromise = openDatabase().then(indexedBackend, () => localBackend());
    return backendPromise;
  }
  function enqueue(action) {
    const result = queue.then(action);
    queue = result.catch(() => {});
    return result;
  }
  function fallbackRecord() {
    // When IndexedDB becomes available again, recover a newer fallback save.
    let storage;
    try {storage = root.localStorage;} catch (_) {return null;}
    if (!storage) return null;
    let value;
    try {value = storage.getItem(KEY);} catch (_) {return null;}
    return decode(value);
  }
  function forgetFallback() {
    try {root.localStorage?.removeItem(KEY);} catch (_) { /* IndexedDB already committed. */ }
  }
  function load() {
    return enqueue(async () => {
      const target = await backend();
      let envelope = await target.read();
      if (target.name === 'indexedDB') {
        const fallback = fallbackRecord();
        if (fallback && (!envelope || Date.parse(fallback.savedAt) > Date.parse(envelope.savedAt))) {
          // Do not discard the fallback if migrating it fails.
          await target.write(fallback);
          envelope = fallback;
          forgetFallback();
        }
      }
      if (!envelope) return null;
      lastSavedTime = Math.max(lastSavedTime, Date.parse(envelope.savedAt));
      return serialize(envelope.project);
    });
  }
  function save(project) {
    let snapshot;
    try {snapshot = serialize(project);} catch (error) {return Promise.reject(error);}
    return enqueue(async () => {
      const target = await backend();
      lastSavedTime = Math.max(Date.now(), lastSavedTime + 1);
      const savedAt = new Date(lastSavedTime).toISOString(), envelope = {version:1, savedAt, project:snapshot};
      await target.write(envelope);
      if (target.name === 'indexedDB') forgetFallback();
      return {saved:true, backend:target.name, savedAt};
    });
  }
  function clear() {
    return enqueue(async () => {
      const errors = [];
      let target = null, cleared = false;
      try { target = await backend(); } catch (error) { errors.push(error); }
      // Remove the raw fallback even when it is malformed. Decoding first can
      // turn an explicit clear into an error and leave private data behind.
      try {
        const local = root.localStorage;
        if (local) { local.removeItem(KEY); cleared = true; }
      } catch (error) { errors.push(error); }
      if (target?.name === 'indexedDB') {
        try { await target.clear(); cleared = true; } catch (error) { errors.push(error); }
      } else {
        // A page may have fallen back earlier while IndexedDB was temporarily
        // unavailable. Retry it so an older copy cannot reappear on reopening.
        let db = null;
        try {
          if (root.indexedDB) {
            db = await openDatabase();
            await indexedBackend(db).clear();
            cleared = true;
          }
        } catch (error) { errors.push(error); }
        finally { if (db) db.close(); }
      }
      if (errors.length || !cleared) {
        throw failure('STORAGE_CLEAR_INCOMPLETE', '部分本机存储暂时无法清除，请关闭其他有数页面后重试。尚未确认全部清除成功。', errors[0]);
      }
      lastSavedTime = 0;
    });
  }

  root.YoushuLedgerStorage = Object.freeze({load, save, clear});
})(typeof window !== 'undefined' ? window : globalThis);
