export type ClassSessionActionType = 'start' | 'end';
export type ClassSessionSyncStatus = 'pending' | 'synced' | 'failed';

export type ClassSessionQueueItem = {
  id: string;
  action: ClassSessionActionType;
  course: string;
  timetable: string;
  date: string;
  time: string;
  recordId?: string;
  status: ClassSessionSyncStatus;
  createdAt: number;
  updatedAt: number;
  error?: string;
};

const DB_NAME = 'kora-offline';
const DB_VERSION = 2;
const STORE_NAME = 'class_session_queue';

const openDatabase = () => {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not supported in this browser.'));
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('attendance_outbox')) {
        const store = db.createObjectStore('attendance_outbox', { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('course', 'course', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('course', 'course', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>
) => {
  const db = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB operation failed.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed.'));
  });
};

export const queueClassSessionAction = async (item: Omit<ClassSessionQueueItem, 'createdAt' | 'updatedAt' | 'status'>) => {
  const now = Date.now();
  const record: ClassSessionQueueItem = {
    ...item,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  return withStore('readwrite', (store) => store.put(record));
};

export const getQueuedClassSessionActions = async () => {
  return withStore<ClassSessionQueueItem[]>('readonly', (store) => store.getAll());
};

export const getPendingClassSessionActions = async () => {
  const all = await getQueuedClassSessionActions();
  return all.filter(item => item.status === 'pending');
};

export const updateClassSessionActionStatus = async (
  id: string,
  status: ClassSessionSyncStatus,
  error?: string
) => {
  const db = await openDatabase();

  return new Promise<ClassSessionQueueItem | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as ClassSessionQueueItem | undefined;
      if (!existing) {
        resolve(undefined);
        db.close();
        return;
      }

      const updated: ClassSessionQueueItem = {
        ...existing,
        status,
        error,
        updatedAt: Date.now(),
      };

      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve(updated);
      putRequest.onerror = () => reject(putRequest.error || new Error('Failed to update session action status.'));
    };

    getRequest.onerror = () => reject(getRequest.error || new Error('Failed to load session action.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error || new Error('Failed to update session action queue.'));
  });
};

export const removeClassSessionAction = async (id: string) => {
  return withStore('readwrite', (store) => store.delete(id));
};
