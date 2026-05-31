import { Query } from "appwrite";
import { ID, databases } from "../../appwrite";

type ClassRecord = {
  $id: string;
  course: string;
  timetable: string;
  date: string;
  occurred: boolean | string;
  [key: string]: any;
};

type ClassInstance = {
  course: string;
  timetable: string;
  date: string;
  start: string;
  end: string;
};

const normalizeKey = (course: string, timetable: string, date: string) =>
  `${course}::${timetable}::${date}`;

const recordKey = (record: ClassRecord) =>
  normalizeKey(record.course, record.timetable || '', record.date || '');

const instanceKey = (instance: ClassInstance) =>
  normalizeKey(instance.course, instance.timetable, instance.date);

export const getClassRecordsForCourse = async (course: string) => {
  try {
    const response = await databases.listRows(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
      [
        Query.equal('course', course),
        Query.limit(200),
      ]
    );

    return response.rows as unknown as ClassRecord[];
  } catch (error) {
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

export const createClassRecord = async (data: ClassInstance) => {
  try {
    return await databases.createRow(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
      ID.unique(),
      {
        course: data.course,
        timetable: data.timetable,
        date: data.date,
        start: data.start,
        end: data.end,
        occurred: false,
      }
    );
  } catch (error) {
    console.log(`Error creating class record: ${error}`);
    throw error;
  }
};

export type { ClassInstance, ClassRecord };
