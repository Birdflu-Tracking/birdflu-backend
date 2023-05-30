import { Request, Response, Router } from "express";
import { FarmReports } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import {
  batchCollection,
  db,
  farmReportsCollection,
  sellerCollection,
  userReportsCollection,
} from "../services/initDb";
import { getCounts } from "../lib/utils";

export const healthWorkerRouter = Router();

/**
 * This route will be used to ccreate a symptom request
 *
 * {
 *  farmId: string,
 * }
 */
healthWorkerRouter.post(
  "/send/symptom/request",
  async (req: Request, res: Response) => {
    try {
      const farmReport: FarmReports = {
        chickenSymptoms: null,
        farmId: req.body.farmId,
        HealthWorkerId: req.session.userData.userId,
        initiatedAt: Timestamp.now(),
        submittedAt: null,
        predictionResult: null,
        submitted: false,
      };

      const createdRequest = await farmReportsCollection.add(farmReport);
      !createdRequest.id
        ? res
          .status(500)
          .json({ message: "Error while creating request", success: false })
        : res.status(200).json({
          message: "Send request successfully to " + req.body.farmId,
          success: true,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while sending symptoms request",
        error: error.message,
        success: false,
      });
    }
  }
);

/**
 * This route will be used to mark a batch infected
 *
 * {
 *  batchId: string
 * }
 */
healthWorkerRouter.post(
  "/mark/batch/infected",
  async (req: Request, res: Response) => {
    try {
      const updatedBatch = await db.doc(`Batches/${req.body.batchId}`).update({
        infected: true,
      });

      !updatedBatch.isEqual
        ? res
          .status(500)
          .json({
            message: "Error while marking batch infected, try again",
            success: false,
          })
        : res
          .status(200)
          .json({ message: "Marked batch as infected", success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while marking chain infected",
        error: error.message,
        success: false,
      });
    }
  }
);

/**
 * This route will be used to get farm reports
 * by the health worker.
 */
healthWorkerRouter.get(
  "/reports/farms",
  async (req: Request, res: Response) => {
    try {
      const reports: Array<object> = [];

      var reportsPromise = new Promise<void>(async (resolve) => {
        const farmReportsCollectionData = await farmReportsCollection.get();
        farmReportsCollectionData.docs.forEach(async (doc, index) => {
          const sellersPossiblyInfected: Array<string> = [];
          const docData = doc.data();
          (
            await batchCollection.where("farmerId", "==", docData.farmId).get()
          ).docs.forEach((batchDoc) => {
            if (batchDoc.data().sellerId != null) {
              sellersPossiblyInfected.push(batchDoc.data().sellerId);
            }
          });

          reports.push({
            ...doc.data(),
            reportId: doc.id,
            sellersPossiblyInfected: [...new Set(sellersPossiblyInfected)],
          });
          if (index === farmReportsCollectionData.docs.length - 1) resolve();
        });
      });

      await reportsPromise;
      res
        .status(200)
        .json({ message: "Found reports", reports, success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while getting reports",
        error: error.message,
        success: false,
      });
    }
  }
);

/**
 * This route will be used to get user reports
 * by the health worker.
 */
healthWorkerRouter.get("reports/users", async (req: Request, res: Response) => {
  try {
    // Seller name, root farm name, number of reports
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting user reports",
      error: error.message,
      success: false,
    });
  }
});

/**
 * This route will be used by health worker
 * to get the reported seller to list
 * on reports page.
*/
healthWorkerRouter.get(
  "/reported-sellers",
  async (req: Request, res: Response) => {
    try {
      const reportedSellerIds: Array<string> = [];
      const result: Array<Object> = [];
      (await userReportsCollection.get()).forEach((doc: any) => reportedSellerIds.push(doc.data().poultryShop));

      await Promise.all(reportedSellerIds.map(async (sellerId) => {
        var seller = (await db.doc(sellerId).get());
        var batches = await batchCollection.where("sellerId", "==", sellerId.split("/")[1]).get();
        await Promise.all(batches.docs.map(async (batch) => {
          var farm = (await db.doc(`Farms/${batch.data().farmerId}`).get()).data();
          result.push({ sellerName: seller.data().sellerShopName, rootFarm: farm.farmName, count: getCounts(reportedSellerIds, sellerId), sellerId: seller.id })
        }))
      }));

      res.status(200).json({ reportedSellers: result, success: true })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while getting reported sellers",
        error: error.message,
        success: false,
      });
    }
  }
);

/**
 * This route will be used to get reports of
 * a single poultry shop.
 */
healthWorkerRouter.get(
  "/reports/seller/:sellerId",
  async (req: Request, res: Response) => {
    try {
      // Seller name, owner name, phone number, root farm, and all reports of that seller
      let sellerId = req.params.sellerId;
      const sellerReports: Array<string> = [];
      (await userReportsCollection.where("poultryShop", "==", `Sellers/${sellerId}`).get()).forEach((doc: any) => sellerReports.push(doc.data()));
      const sellerData = (await db.doc(`Sellers/${sellerId}`).get()).data()

      res.status(200).send({ message: { sellerData, sellerReports }, success: true })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while reports of the poultry shop",
        error: error.message,
        success: false,
      });
    }
  }
);
