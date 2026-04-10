import { account } from "../../appwrite";

export const login = async (email: string, password: string) => {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        console.error(`Error logging in: ${error}`);
        throw error;
    }
};
