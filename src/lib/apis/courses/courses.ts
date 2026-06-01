import { Query } from "appwrite";
import { databases, ID } from "../../appwrite";
import { isOffline, readCache, writeCache } from "../../localCache/offlineCache";

// Helper function to convert day name to index (Sunday = 0, Monday = 1, etc.)
const getDayIndex = (dayName: string): number => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
}

// Helper function to convert time to 24-hour format (ensures HH:MM format)
const convertTo24Hour = (time: string): string => {
    return time; // Already in 24-hour format from the form (HH:MM)
}

export const createCourse = async (title: string, code: string, teachers: string[], venue: string, unit: number, schedule: {day: string, start: string, end: string, startDate?: string, endDate?: string, active?: boolean}[])=>{
    try {
        const course = await databases.createRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COURSE_TABLE_ID,
            ID.unique(),
            {
                title,
                code,
                teachers,
                venue,
                unit
            }
        )
        await Promise.all(schedule.map((item) => createTimetable(course.$id, item)));
    } catch (error) {
        console.log(`Error creating course: ${error}`);
        throw error;
    }
}

export const getCourses = async () => {
    const cacheKey = 'courses:list';
    try {
        if (isOffline()) {
            const cached = readCache<any[]>(cacheKey);
            return cached?.value || [];
        }

        const coursesResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COURSE_TABLE_ID,
            [Query.limit(200)]
        )

        const timetableResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TIME_TABLE_TABLE_ID,
            [Query.limit(200)]
        )

        // Merge timetable data into courses
        const coursesWithSchedule = coursesResponse.rows.map(course => ({
            ...course,
            schedule: timetableResponse.rows.filter(slot => slot.course === course.$id)
        }));

        writeCache(cacheKey, coursesWithSchedule);

        return coursesWithSchedule;
    } catch (error) {
        const cached = readCache<any[]>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting courses: ${error}`);
        throw error;
    }
}

export const createTimetable = async (course: string, schedule: {day: string, start: string, end: string, startDate?: string, endDate?: string, active?: boolean})=>{
    try {
        await databases.createRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TIME_TABLE_TABLE_ID,
            ID.unique(),
            {
                course,
                day: getDayIndex(schedule.day),
                start: convertTo24Hour(schedule.start),
                end: convertTo24Hour(schedule.end),
                startDate: schedule.startDate || '',
                endDate: schedule.endDate || '',
                active: schedule.active ? "True" : "False"
            }
        )
    } catch (error) {
        console.log(`Error creating timetable: ${error}`);
        throw error;
    }
}

export const deleteCourseTimetable = async (courseId: string) => {
    try {
        const timetableResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TIME_TABLE_TABLE_ID,
            [Query.equal('course', courseId), Query.limit(200)]
        );

        await Promise.all(
            timetableResponse.rows.map((row: any) =>
                databases.deleteRow(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    import.meta.env.VITE_APPWRITE_TIME_TABLE_TABLE_ID,
                    row.$id
                )
            )
        );
    } catch (error) {
        console.log(`Error deleting timetable rows: ${error}`);
        throw error;
    }
}

export const replaceCourseTimetable = async (courseId: string, schedule: {day: string, start: string, end: string, startDate?: string, endDate?: string}[]) => {
    try {
        await deleteCourseTimetable(courseId);
        await Promise.all(
            schedule.map((slot) => createTimetable(courseId, slot))
        );
    } catch (error) {
        console.log(`Error replacing timetable: ${error}`);
        throw error;
    }
}

export const getCurriculum = async (courseId: string) => {
    const cacheKey = `courses:curriculum:${courseId}`;
    try {
        if (isOffline()) {
            const cached = readCache<any>(cacheKey);
            return cached?.value || null;
        }

        const curriculum = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_CURRICULUM_TABLE_ID,
            [Query.equal('course', courseId), Query.limit(1)]
        )
        const result = curriculum.rows[0];
        if (result) writeCache(cacheKey, result);
        return result;
    } catch (error) {
        const cached = readCache<any>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting curriculum: ${error}`);
        throw error;
    }
}

export const getStudentRecommendedCourses = async (department: string, level: string) => {
    const cacheKey = `courses:recommended:${department}:${level}`;
    try {
        if (isOffline()) {
            const cached = readCache<any[]>(cacheKey);
            return cached?.value || [];
        }

        const recommendedCoursesResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_CURRICULUM_TABLE_ID,
            [Query.contains('departments', department), Query.contains('level', level)]
        )
        const recommendedCourses = await Promise.all(
            recommendedCoursesResponse.rows.map((course: any) =>
                databases.getRow(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    import.meta.env.VITE_APPWRITE_COURSE_TABLE_ID,
                    course.course
                )
            )
        );
        writeCache(cacheKey, recommendedCourses);
        return recommendedCourses;
    } catch (error) {
        const cached = readCache<any[]>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting student recommended courses: ${error}`);
        throw error;
    }
}

export const getCourseById = async (courseId: string) => {
    const cacheKey = `courses:detail:${courseId}`;
    try {
        if (isOffline()) {
            const cached = readCache<any>(cacheKey);
            return cached?.value || null;
        }

        const course = await databases.getRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COURSE_TABLE_ID,
            courseId
        );

        const timetableResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TIME_TABLE_TABLE_ID,
            [Query.equal('course', courseId)]
        );

        return {
            ...course,
            schedule: timetableResponse.rows,
        };
    } catch (error) {
        const cached = readCache<any>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting course by id: ${error}`);
        throw error;
    }
}

export const searchCourses = async (query: string) => {
    const cacheKey = `courses:search:${query}`;
    try {
        if (isOffline()) {
            const cached = readCache<any[]>(cacheKey);
            return cached?.value || [];
        }

        const result = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COURSE_TABLE_ID,
            [Query.contains('title', query), Query.limit(20)]
        )
        writeCache(cacheKey, result.rows);
        return result.rows;
    } catch (error) {
        const cached = readCache<any[]>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error searching courses: ${error}`);
        throw error;
    }
}

export const updateCourse = async (
    courseId: string,
    data: {
      title?: string;
      code?: string;
      teachers?: string[];
      venue?: string;
      unit?: number;
    }
) => {
    try {
        await databases.updateRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_COURSE_TABLE_ID,
            courseId,
            {
                ...data,
            }
        );
    } catch (error) {
        console.log(`Error updating course: ${error}`);
        throw error;
    }
}


