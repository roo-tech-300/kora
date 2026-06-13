import { Query } from "appwrite";
import { databases, ID, storage } from "../../appwrite";
import { isOffline, readCache, writeCache } from "../../localCache/offlineCache";

export const createStudent = async(
    name: string,
    matric_number: string,
    level: string,
    department: string,
    guardianEmail: string,
    guardianPhone: string,
    studentImage: File,
    gender: string,
    faculty: string,
    age: number,
    phone_number: string,
    email?: string,
    courseIds: string[] = []
) => {
    try{
        const image = await uploadImage(studentImage);
        const student = await databases.createRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_TABLE_ID,
            ID.unique(),
            {
                name,
                matric_number,
                level,
                department,
                guardianEmail,
                guardianPhone,
                image,
                gender,
                faculty,
                age,
                phone_number,
                email
            }
        )

        // Enroll student in courses
        courseIds.forEach(async (courseId) => {
            await enrollStudentInCourse(student.$id, courseId);
        })

        return student;
    }catch(error){
        console.log(`Error creating student: ${error}`);
        throw error;
    }
}

export const uploadImage = async (file: File)=> {
    try {
        const image = await storage.createFile(
            import.meta.env.VITE_APPWRITE_MEDIA_BUCKET_ID,
            ID.unique(),
            file
        );
        return image.$id;
    } catch (error) {
        console.log(`Error uploading image: ${error}`);
        throw error;
    }
}

export const getStudents = async () => {
    const cacheKey = 'students:list';
    try {
        if (isOffline()) {
            const cached = readCache<any[]>(cacheKey);
            return cached?.value || [];
        }

        const students = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_TABLE_ID,
            [Query.limit(200)]
        )
        writeCache(cacheKey, students.rows);
        return students.rows;
    } catch (error) {
        const cached = readCache<any[]>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting students: ${error}`);
        throw error;
    }
}

export const getStudentById = async (studentId: string) => {
    const cacheKey = `students:detail:${studentId}`;
    try {
        if (isOffline()) {
            const cached = readCache<any>(cacheKey);
            return cached?.value || null;
        }

        const student = await databases.getRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_TABLE_ID,
            studentId
        );

        if (student) writeCache(cacheKey, student);
        return student;
    } catch (error) {
        const cached = readCache<any>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting student by id: ${error}`);
        throw error;
    }
}

export const enrollStudentInCourse = async (studentId: string, courseId: string) => {
    try {
        await databases.createRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_COURSES_TABLE_ID,
            ID.unique(),
            {
                student: studentId,
                course: courseId
            }
        )
    } catch (error) {        
        console.log(`Error enrolling student in course: ${error}`);
        throw error;
    }
}

export const getStudentsInCourse = async (courseId: string) => {
    const cacheKey = `students:course:${courseId}`;
    try {
        if (isOffline()) {
            const cached = readCache<any[]>(cacheKey);
            return cached?.value || [];
        }

        const enrolledResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_COURSES_TABLE_ID,
            [Query.equal('course', courseId), Query.limit(200)]
        );

        const studentIds = enrolledResponse.rows
            .map((row: any) => row.student)
            .filter(Boolean);

        if (studentIds.length === 0) {
            writeCache(cacheKey, []);
            return [];
        }

        const studentsResponse = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_TABLE_ID,
            [Query.limit(200)]
        );

        const studentMap = new Map(
            studentsResponse.rows.map((student: any) => [student.$id, student])
        );

        const enrolledStudents = studentIds
            .map((studentId) => studentMap.get(studentId))
            .filter(Boolean);

        writeCache(cacheKey, enrolledStudents);
        return enrolledStudents;
    } catch (error) {
        const cached = readCache<any[]>(cacheKey);
        if (cached) return cached.value;
        console.log(`Error getting students in course: ${error}`);
        throw error;
    }
}
