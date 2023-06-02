import { USER_COLLECTION_NAME } from "../lib/commons";
import {
  batchCollection,
  db,
  farmReportsCollection,
  userCollection,
} from "./initDb";
import { Timestamp } from "@google-cloud/firestore";

export const isBatchOwnedbyUser = async (batchData: any, userId: string) => {
  try {
    if (batchData.currentOwner.path !== `Users/${userId}`) {
      throw new Error("Batch not owned by user");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Batch not owned by user");
  }
};

export const transferBatch = async (
  type: "seller" | "distributor",
  uid: string,
  batchId: string
) => {
  try {
    const userDocRef = (await db.doc(`${USER_COLLECTION_NAME}/${uid}`).get())
      .ref;
    if (type == "distributor") {
      const transferredBatch = await batchCollection.doc(batchId).update({
        distributorId: uid, // Doc ID
        currentOwner: userDocRef,
      });

      if (transferredBatch.isEqual) {
        return true;
      } else {
        return false;
      }
    } else if (type == "seller") {
      const transferredBatch = await batchCollection.doc(batchId).update({
        sellerId: uid,
        currentOwner: userDocRef,
      });

      if (transferredBatch.isEqual) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error("Invalid destination user id");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const createSymptomReport = async (
  predictionResult: boolean,
  chickenSymptoms: object,
  requestId: string
) => {
  const createdReport = await farmReportsCollection.doc(requestId).update({
    submitted: true,
    submittedAt: Timestamp.now(),
    predictionResults: predictionResult,
    chickenSymptoms: { ...chickenSymptoms },
  });

  if (!createdReport.isEqual) {
    throw new Error("Failed sending reports, try again...");
  }

  return true;
};
