import { Client, Account, Databases, Query, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT as string);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export default client;
