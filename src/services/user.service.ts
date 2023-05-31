import {
  batchCollection,
  db,
  distributorCollection,
  farmReportsCollection,
  farmerCollection,
  sellerCollection,
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
  // distributorId: string | null,
  // sellerId: string | null,
  type: "seller" | "distributor",
  uid: string,
  batchId: string
) => {
  try {
    if (type == "distributor") {
      // const distributorDoc = (
      //   await distributorCollection.where("firebaseAuthUid", "==", uid).get()
      // ).docs[0].data();
      // if (!distributorDoc) {
      //   throw new Error("Distributor not found");
      // }
      const userDocRef = (
        await userCollection.where("firebaseAuthUid", "==", uid).get()
      ).docs[0].ref;

      const transferredBatch = await batchCollection.doc(batchId).update({
        distributorId: uid,
        currentOwner: userDocRef,
      });

      if (transferredBatch.isEqual) {
        return true;
      } else {
        return false;
      }
    } else if (type == "seller") {
      // const sellerDoc = (
      //   await sellerCollection.where("firebaseAuthUid", "==", uid).get()
      // ).docs[0].data();
      // if (!sellerDoc) {
      //   throw new Error("Seller not found");
      // }
      const userDocRef = (
        await userCollection.where("firebaseAuthUid", "==", uid).get()
      ).docs[0].ref;

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
