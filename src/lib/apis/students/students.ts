import { Query } from "appwrite";
import { databases, ID, storage } from "../../appwrite";

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
    try {
        const students = await databases.listRows(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_STUDENTS_TABLE_ID,
            [Query.limit(200)]
        )
        return students.rows;
    } catch (error) {
        console.log(`Error getting students: ${error}`);
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