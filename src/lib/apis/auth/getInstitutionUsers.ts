import { Query } from "appwrite";
import { databases } from "../../appwrite";

export const getInstitutionUsers = async () => {
  try {
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const userTableId = import.meta.env.VITE_APPWRITE_USER_TABLE_ID;

    const response = await databases.listRows(
      databaseId,
       userTableId, 
       [Query.limit(200),]
    );

    return response.rows;
  } catch (error) {
    console.error("Failed to fetch institution users:", error);
    throw error;
  }
};
