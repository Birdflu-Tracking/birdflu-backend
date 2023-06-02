import { User } from "../models";
import { healthWorkerCollection, userCollection } from "./initDb";

export const createUser = async (user: User) => {
  const res = await userCollection.add(user);

  return res.id;
};

export const deleteUser = async (email: string) => {};

export const checkUserAlreadyExist = async (user: User) => {
  const res = await userCollection.where("email", "==", user.email).get();

  if (res.empty == false) {
    throw Error("User already exist with same email id " + user.email);
  }
};

export const getUser = async (firebaseAuthUid: string) => {
  console.log(firebaseAuthUid)
  const res = await userCollection
    .where("userId", "==", firebaseAuthUid)
    .get();

  if (res.empty == true) {
    throw Error("User does not exist invalid credentials");
  }

  return res.docs[0];
};

export const getHealthWorker = async (firebaseAuthUid: string) => {
  const res = await healthWorkerCollection
    .where("userId", "==", firebaseAuthUid)
    .get();

  if (res.empty == true) {
    throw Error("Health Worker does not exist invalid credentials");
  }

  return res.docs[0];
};
