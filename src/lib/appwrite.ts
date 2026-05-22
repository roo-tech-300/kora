import { Client, Account, Storage, ID, TablesDB } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT!) // Example: http://localhost/v1
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID!); // Your project ID

export const account = new Account(client);
export const databases = new TablesDB(client);
export const storage = new Storage(client);
export { ID };