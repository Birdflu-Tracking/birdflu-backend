import { Request, Response, Router } from "express";
import { FarmReports } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import { batchCollection, db, farmReportsCollection } from "../services/initDb";

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
        ? res.status(500).json({ message: "Error while creating request" })
        : res.status(200).json({
            message: "Send request successfully to " + req.body.farmId,
          });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while sending symptoms request",
        error: error.message,
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
            .json({ message: "Error while marking batch infected, try again" })
        : res.status(200).json({ message: "Marked batch as infected" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while marking chain infected",
        error: error.message,
      });
    }
  }
);

healthWorkerRouter.get("/reports", async (req: Request, res: Response) => {
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
    res.status(200).json({ message: "Found reports", reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting reports",
      error: error.message,
    });
  }
});

healthWorkerRouter.get(
  "/reports/poultry-shops",
  async (req: Request, res: Response) => {
    try {
      res.send("NOT IMPLEMENTED: Get poultry shops");
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while reports of the poultry shop",
        error: error.message,
      });
    }
  }
);
