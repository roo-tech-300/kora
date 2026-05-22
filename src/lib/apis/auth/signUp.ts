import { account, databases, ID } from "../../appwrite";
import { login } from "./login";

export const signUp = async (email: string, password: string, name: string, title: string) => {
    try {
        const user = await account.create(ID.unique(), email, password, name);
        if(!user){
            return;
        }
        await databases.createRow(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_USER_TABLE_ID,
            ID.unique(),
            {
                title: title,
                name: user.name,
                email: user.email,
                role: "Lecturer",
                status: "Pending"
            }
        );

        return await login(email, password);
    } catch (error) {
        console.log(`Failed to signup ${error}`);
        throw(error)
    }
};
