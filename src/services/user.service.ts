import {
  batchCollection,
  db,
  distributorCollection,
  farmerCollection,
  sellerCollection,
  userCollection,
} from "./initDb";

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
  userId: string,
  batchId: string
) => {
  try {
    if (distributorId) {
      const distributorDoc = (
        await distributorCollection.doc(distributorId).get()
      ).data();
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
    } else {
      const sellerDoc = (await sellerCollection.doc(sellerId).get()).data();
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
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error while transferring batch");
  }
};
