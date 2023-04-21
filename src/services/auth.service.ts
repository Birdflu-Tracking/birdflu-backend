import { User } from "../models";
import { userCollection } from "./initDb";

export const createUser = async (user: User) => {
  const res = await userCollection.add(user);

  return res.id;
};
