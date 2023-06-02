import { Request, Response, Router } from "express";
import { FarmReports, User } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import {
  batchCollection,
  db,
  farmReportsCollection,
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
        HealthWorkerDocId: req.session.userData.userDocId,
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
        ? res.status(500).json({
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
      const results: Array<{
        sellerName: string;
        rootFarmId: string;
        rootFarmName: string;
        count: Number;
        sellerId: string;
      }> = [];
      (await userReportsCollection.get()).forEach((doc: any) =>
        reportedSellerIds.push(doc.data().poultryShopDocId)
      );

      await Promise.all(
        reportedSellerIds.map(async (sellerId) => {
          var seller = await db.doc(`Users/${sellerId}`).get();
          var batches = await batchCollection
            .where("sellerId", "==", sellerId)
            .get();

          await Promise.all(
            batches.docs.map(async (batch) => {
              var farm = await db.doc(`Users/${batch.data().farmerId}`).get();
              if (
                results.filter((result) => result.rootFarmId == farm.id)
                  .length == 0
              ) {
                results.push({
                  sellerName: seller.data().outletName,
                  rootFarmId: farm.id,
                  rootFarmName: farm.data().outletName,
                  count: getCounts(reportedSellerIds, sellerId),
                  sellerId: seller.id,
                });
              }
            })
          );
        })
      );

      res.status(200).json({ reportedSellers: results, success: true });
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
  "/reports/seller/:sellerDocId",
  async (req: Request, res: Response) => {
    try {
      // Seller name, owner name, phone number, root farm, and all reports of that seller
      let sellerDocId = req.params.sellerDocId;
      const sellerReports: Array<Object> = [];
      (
        await userReportsCollection
          .where("poultryShopDocId", "==", sellerDocId)
          .get()
      ).forEach((doc: any) =>
        sellerReports.push({ reportId: doc.id, reportData: doc.data() })
      );
      const sellerData = await db.doc(`Users/${sellerDocId}`).get();

      const rootFarms: Array<Object> = await batchCollection
        .where("sellerId", "==", sellerData.id)
        .get()
        .then(async (batches) => {
          const farms: Array<{ farmId: string; farmData: Object }> = [];

          await Promise.all(
            batches.docs.map(async (batch) => {
              const farm = await db.doc(`Users/${batch.data().farmerId}`).get();
              if (
                farms.filter((farm) => farm.farmId == batch.data().farmerId)
                  .length == 0
              ) {
                farms.push({
                  farmId: batch.data().farmerId,
                  farmData: farm.data(),
                });
              }
            })
          );

          return farms;
        });

      res.status(200).send({
        message: {
          sellerData: sellerData.data(),
          sellerReports,
          rootFarms,
        },
        success: true,
      });
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
