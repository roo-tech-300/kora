export type AttendanceSyncStatus = 'pending' | 'synced' | 'failed';

export type AttendanceQueueItem = {
  id: string;
  course: string;
  timetable: string;
  date: string;
  studentId?: string;
  occurred: boolean;
  payload: Record<string, any>;
  status: AttendanceSyncStatus;
  createdAt: number;
  updatedAt: number;
  error?: string;
};

const DB_NAME = 'kora-offline';
const DB_VERSION = 1;
const STORE_NAME = 'attendance_outbox';

const openDatabase = () => {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not supported in this browser.'));
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('course', 'course', { unique: false });
        store.createIndex('date', 'date', { unique: false });
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

export const buildAttendanceItemId = (course: string, timetable: string, date: string, studentId = '') => {
  return `${course}::${timetable}::${date}::${studentId}`;
};

export const queueAttendanceRecord = async (item: Omit<AttendanceQueueItem, 'createdAt' | 'updatedAt' | 'status'>) => {
  const now = Date.now();
  const record: AttendanceQueueItem = {
    ...item,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  return withStore('readwrite', (store) => store.put(record));
};

export const getQueuedAttendanceRecords = async () => {
  return withStore<AttendanceQueueItem[]>('readonly', (store) => store.getAll());
};

export const updateAttendanceRecordStatus = async (
  id: string,
  status: AttendanceSyncStatus,
  error?: string
) => {
  const db = await openDatabase();

  return new Promise<AttendanceQueueItem | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as AttendanceQueueItem | undefined;
      if (!existing) {
        resolve(undefined);
        db.close();
        return;
      }

      const updated: AttendanceQueueItem = {
        ...existing,
        status,
        error,
        updatedAt: Date.now(),
      };

      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve(updated);
      putRequest.onerror = () => reject(putRequest.error || new Error('Failed to update attendance status.'));
    };

    getRequest.onerror = () => reject(getRequest.error || new Error('Failed to load attendance record.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error || new Error('Failed to update attendance queue.'));
  });
};

export const removeAttendanceRecord = async (id: string) => {
  return withStore('readwrite', (store) => store.delete(id));
};
