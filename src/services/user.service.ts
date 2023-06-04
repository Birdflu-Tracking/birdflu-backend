import { USER_COLLECTION_NAME } from "../lib/commons";
import {
  batchCollection,
  db,
  farmReportsCollection,
  userCollection,
} from "./initDb";
import { Timestamp } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";

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
  finalResult: boolean,
  predictionResult: string,
  chickenSymptoms: object,
  requestId: string
) => {
  const createdReport = await farmReportsCollection.doc(requestId).update({
    submitted: true,
    submittedAt: Timestamp.now(),
    avianResult: finalResult,
    predictionResult: predictionResult,
    chickenSymptoms: { ...chickenSymptoms },
  });

  if (!createdReport.isEqual) {
    throw new Error("Failed sending reports, try again...");
  }

  return true;
};

export const changeInfectedTo = async (
  value: boolean,
  batches: Array<firestore.DocumentData>
) => {
  await Promise.all(
    batches.map(async (batch) => {
      console.log("BATCH", batch.data().farmerId);
      console.log("BATCH", batch.data().distributorId);
      console.log("BATCH", batch.data().sellerId);
      await db
        .doc(`${USER_COLLECTION_NAME}/${batch.data().farmerId}`)
        .update({
          infected: value,
        })
        .catch((err) => {
          console.log(`DOCUMENT ${batch.data().farmerId} NOT FOUND`);
        });

      await db
        .doc(`${USER_COLLECTION_NAME}/${batch.data().distributorId}`)
        .update({
          infected: value,
        })
        .catch((err) => {
          console.log(`DOCUMENT ${batch.data().distributorId} NOT FOUND`);
        });

      await db
        .doc(`${USER_COLLECTION_NAME}/${batch.data().sellerId}`)
        .update({
          infected: value,
        })
        .catch((err) => {
          console.log(`DOCUMENT ${batch.data().sellerId} NOT FOUND`);
        });
    })
  );
};
