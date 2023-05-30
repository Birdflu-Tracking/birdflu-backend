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
  distributorId: string | null,
  sellerId: string | null,
  batchId: string
) => {
  try {
    if (distributorId) {
      const distributorDoc = (
        await distributorCollection.doc(distributorId).get()
      ).data();
      if (!distributorDoc) {
        throw new Error("Distributor not found");
      }
      const userDocRef = (await db.doc(distributorDoc.userId.path).get()).ref;

      const transferredBatch = await batchCollection.doc(batchId).update({
        distributorId: distributorId,
        currentOwner: userDocRef,
      });

      if (transferredBatch.isEqual) {
        return true;
      } else {
        return false;
      }
    } else if (sellerId) {
      const sellerDoc = (await sellerCollection.doc(sellerId).get()).data();
      if (!sellerDoc) {
        throw new Error("Seller not found");
      }
      const userDocRef = (await db.doc(sellerDoc.userId.path).get()).ref;

      const transferredBatch = await batchCollection.doc(batchId).update({
        sellerId: sellerId,
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
