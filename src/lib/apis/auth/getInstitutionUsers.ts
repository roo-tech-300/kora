import { Query } from "appwrite";
import { databases } from "../../appwrite";
import { isOffline, readCache, writeCache } from "../../localCache/offlineCache";

export const getInstitutionUsers = async () => {
  const cacheKey = 'auth:institution-users';
  try {
    if (isOffline()) {
      const cached = readCache<any[]>(cacheKey);
      return cached?.value || [];
    }

    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const userTableId = import.meta.env.VITE_APPWRITE_USER_TABLE_ID;

    const response = await databases.listRows(
      databaseId,
       userTableId, 
       [Query.limit(200),]
    );

    writeCache(cacheKey, response.rows);
    return response.rows;
  } catch (error) {
    const cached = readCache<any[]>(cacheKey);
    if (cached) return cached.value;
    console.error("Failed to fetch institution users:", error);
    throw error;
  }
};
