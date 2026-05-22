import { Query } from "appwrite";
import { account, databases } from "../../appwrite";

export type UserRole = "Admin" | "Lecturer";
export type UserStatus = "Accepted" | "Pending" | string;

export type CurrentUserProfile = {
  accountId: string;
  documentId: string;
  name: string;
  email: string;
  role: UserRole | string;
  status: UserStatus;
  title?: string;
};

const getRequiredEnv = (key: "VITE_APPWRITE_DATABASE_ID" | "VITE_APPWRITE_USER_TABLE_ID") => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const getCurrentUserProfile = async (): Promise<CurrentUserProfile> => {
  try {
    const currentAccount = await account.get();
    const databaseId = getRequiredEnv("VITE_APPWRITE_DATABASE_ID");
    const userTableId = getRequiredEnv("VITE_APPWRITE_USER_TABLE_ID");

    const response = await databases.listRows(databaseId, userTableId, [
      Query.equal("email", currentAccount.email),
      Query.limit(1),
    ]);

    const userProfile = response.rows[0];

    if (!userProfile) {
      throw new Error(`No profile found for ${currentAccount.email}`);
    }

    return {
      accountId: currentAccount.$id,
      documentId: userProfile.$id,
      name: String(userProfile.name ?? currentAccount.name ?? ""),
      email: String(userProfile.email ?? currentAccount.email),
      role: String(userProfile.role ?? ""),
      status: String(userProfile.status ?? ""),
      title: userProfile.title ? String(userProfile.title) : undefined,
    };
  } catch (error) {
    console.error("Failed to fetch current user profile:", error);
    throw error;
  }
};
