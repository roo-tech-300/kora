import { Query } from "appwrite";
import { ID, databases } from "../../appwrite";
import { isOffline, readCache, writeCache } from "../../localCache/offlineCache";

type ClassRecord = {
  $id: string;
  course: string;
  timetable: string;
  date: string;
  time?: string;
  status: 'Done' | 'Pending' | 'Undone';
  [key: string]: any;
};

type ClassInstance = {
  course: string;
  timetable: string;
  date: string;
  time: string;
};

const normalizeKey = (course: string, timetable: string, date: string) =>
  `${course}::${timetable}::${date}`;

const recordKey = (record: ClassRecord) =>
  normalizeKey(record.course, record.timetable || '', record.date || '');

const instanceKey = (instance: ClassInstance) =>
  normalizeKey(instance.course, instance.timetable, instance.date);

export const getClassRecordsForCourse = async (course: string) => {
  const cacheKey = `classes:course:${course}`;

  try {
    if (isOffline()) {
      const cached = readCache<ClassRecord[]>(cacheKey);
      return cached?.value || [];
    }

    const response = await databases.listRows(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
      [
        Query.equal('course', course),
        Query.limit(200),
      ]
    );

    const records = response.rows as unknown as ClassRecord[];
    writeCache(cacheKey, records);
    return records;
  } catch (error) {
    const cached = readCache<ClassRecord[]>(cacheKey);
    if (cached) return cached.value;
    console.log(`Error fetching class records for course ${course}: ${error}`);
    throw error;
  }
};

export const findExistingClassInstances = async (course: string, instances: ClassInstance[]) => {
  const classRecords = await getClassRecordsForCourse(course);
  const existingKeys = new Set(classRecords.map(recordKey));
  return instances.filter((instance) => existingKeys.has(instanceKey(instance)));
};

export const findMissingClassInstances = async (course: string, instances: ClassInstance[]) => {
  const classRecords = await getClassRecordsForCourse(course);
  const existingKeys = new Set(classRecords.map(recordKey));
  return instances.filter((instance) => !existingKeys.has(instanceKey(instance)));
};

export const createClassRecord = async (data: ClassInstance, customId?: string) => {
  try {
    const record = await databases.createRow(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
      customId ? ID.custom(customId) : ID.unique(),
      {
        course: data.course,
        timetable: data.timetable,
        date: data.date,
        time: data.time,
        status: 'Pending',
      }
    );

    const cacheKey = `classes:course:${data.course}`;
    const cached = readCache<ClassRecord[]>(cacheKey);
    if (cached) {
      writeCache(cacheKey, [...cached.value, record as unknown as ClassRecord]);
    }

    return record;
  } catch (error) {
    console.log(`Error creating class record: ${error}`);
    throw error;
  }
};

export const updateClassRecord = async (recordId: string, data: Partial<ClassRecord>) => {
  try {
    const record = await databases.updateRow(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
      recordId,
      data
    );

    if (record && (record as any).course) {
      const cacheKey = `classes:course:${(record as any).course}`;
      const cached = readCache<ClassRecord[]>(cacheKey);
      if (cached) {
        const updated = cached.value.map(r => r.$id === recordId ? (record as unknown as ClassRecord) : r);
        writeCache(cacheKey, updated);
      }
    }

    return record;
  } catch (error) {
    console.log(`Error updating class record ${recordId}: ${error}`);
    throw error;
  }
};

export type { ClassInstance, ClassRecord };
