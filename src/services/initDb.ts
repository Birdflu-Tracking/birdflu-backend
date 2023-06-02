import * as admin from "firebase-admin";
import {
  BATCH_COLLECTION_NAME,
  DISTRIBUTOR_COLLECTION_NAME,
  FARM_COLLECTION_NAME,
  FARM_REPORTS_COLLECTION_NAME,
  HEALTH_WORKER_COLLECTION_NAME,
  NFC_TAGS_COLLECTION_NAME,
  SELLER_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  USER_REPORTS_COLLECTION_NAME,
} from "../lib/commons";
var serviceAccount = require("../../birdflu-tracker-firebase-adminsdk-3635x-1d9e2bbf9b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const userCollection = db.collection(USER_COLLECTION_NAME);
// export const farmerCollection = db.collection(FARM_COLLECTION_NAME);
// export const distributorCollection = db.collection(DISTRIBUTOR_COLLECTION_NAME);
// export const sellerCollection = db.collection(SELLER_COLLECTION_NAME);
export const batchCollection = db.collection(BATCH_COLLECTION_NAME);
export const healthWorkerCollection = db.collection(
  HEALTH_WORKER_COLLECTION_NAME
);
export const farmReportsCollection = db.collection(
  FARM_REPORTS_COLLECTION_NAME
);
export const userReportsCollection = db.collection(
  USER_REPORTS_COLLECTION_NAME
);
export const nfcTagCollection = db.collection(NFC_TAGS_COLLECTION_NAME);

export { admin };
