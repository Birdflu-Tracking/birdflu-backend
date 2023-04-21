import * as admin from "firebase-admin";
import {
  DISTRIBUTOR_COLLECTION_NAME,
  FARM_COLLECTION_NAME,
  SELLER_COLLECTION_NAME,
  USER_COLLECTION_NAME,
} from "../lib/commons";
var serviceAccount = require("../../birdflu-tracker-firebase-adminsdk-3635x-1d9e2bbf9b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const userCollection = db.collection(USER_COLLECTION_NAME);
export const farmerCollection = db.collection(FARM_COLLECTION_NAME);
export const distributorCollection = db.collection(DISTRIBUTOR_COLLECTION_NAME);
export const sellerCollection = db.collection(SELLER_COLLECTION_NAME);
