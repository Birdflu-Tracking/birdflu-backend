import { Request, Response, Router } from "express";
import {
  batchCollection,
  db,
  farmReportsCollection,
  farmerCollection,
  nfcTagCollection,
} from "../services/initDb";
import { Batch, NFCTags } from "../models";
import {
  createSymptomReport,
  isBatchOwnedbyUser,
  transferBatch,
} from "../services/user.service";

export const userRouter = Router();

// POST Routes
userRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    if (!req.session.userData.loggedIn)
      return res
        .status(401)
        .send({ message: "User not logged in", success: false });

    req.session.destroy(() => {
      console.log("Destroyed");
      res
        .status(200)
        .send({ message: "Logged out successfully", success: true });
    });
  } catch (error) {
    res.status(401).send({ message: "User not logged in", success: false });
  }
});

/**
 * This route is used to create a batch
 *
 * {
 *  batchSize: number;
 * }
 *
 */
userRouter.post("/create/batch", async (req: Request, res: Response) => {
  try {
    if (req.session.userData.userType != "farmer") {
      throw new Error("Only farmer can create a batch");
    } else if (isNaN(req.body.batchSize)) {
      throw new Error(`Invalid batch size ${req.body.batchSize}`);
    }

    const farm = (
      await farmerCollection
        .where("userId", "==", db.doc(`/Users/${req.session.userData.userId}`))
        .get()
    ).docs[0];
    const batch: Batch = {
      batchSize: Number(req.body.batchSize),
      createdAt: new Date(),
      farmerId: farm.id,
      currentOwner: db.doc(`Users/${req.session.userData.userId}`),
      infected: false,
      distributorId: null,
      sellerId: null,
    };

    const createdBatch = await batchCollection.add(batch);
    !createdBatch
      ? res.status(500).json({
          message: "Batch creation failed",
          error: "Internal server error",
          success: false,
          data: (await createdBatch.get()).data(),
        })
      : res.status(200).json({
          message: "Batch created successfully",
          data: batch,
          success: true,
        });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating batch",
      error: error.message,
      success: false,
    });
  }
});

/**
 * This route will be used to transfer a batch.
 * Either from farmer to distributor or distributor to seller.
 *
 * {
 *  batchId: string,
 *  nfcCode: string,
 * }
 */
userRouter.post("/transfer/batch", async (req: Request, res: Response) => {
  try {
    const { batchId, nfcCode, type } = req.body;
    const batchData = (await batchCollection.doc(batchId).get()).data();
    const nfcDoc = (
      await nfcTagCollection.where("nfcCode", "==", nfcCode).get()
    ).docs[0].data();

    if (!batchData.distributorId || !batchData.sellerId) {
      await isBatchOwnedbyUser(batchData, req.session.userData.userId);
      const transferredBatch = await transferBatch(
        nfcDoc.type,
        nfcCode.uid,
        batchId
      );
      !transferredBatch
        ? res
            .status(500)
            .json({ message: "Error while transferring batch", success: false })
        : res
            .status(200)
            .json({ message: "Transferred batch successfully", success: true });
    } else {
      throw new Error("Batch is already transfered");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while transfering batch",
      error: error.message,
      success: false,
    });
  }
});

/**
 * This route will be used to send symptom report by farmer
 * once health worker sends a request.
 *
 * {
 *  requestId: string,
 *  chickenSymptoms: Array<Array<{
 *    | "depression"
 *    | "combs_wattle_blush_face"
 *    | "swollen_face_region"
 *    | "narrowness_of_eyes"
 *    | "balance_desorder"
 *  }>>,
 *  predictionResults: boolean
 * }
 */
userRouter.post("/farmer/report", async (req: Request, res: Response) => {
  try {
    const report = (
      await farmReportsCollection.doc(req.body.requestId).get()
    ).data();
    if (!report) {
      throw new Error("Request not found, invalid request id.");
    } else if (req.body.chickenSymptoms.length != 4) {
      throw new Error("4 chicken symptoms were not provided.");
    } else if (report.submitted == true) {
      throw new Error("Report already submitted.");
    }

    const createdReport = await createSymptomReport(
      req.body.predictionResults,
      req.body.chickenSymptoms,
      req.body.requestId
    );
    !createdReport
      ? res.status(500).json({
          message: "Error while sending report",
          error: "Internal server error",
          success: false,
        })
      : res
          .status(200)
          .json({ message: "Created report successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while reporting symptoms",
      error: error.message,
      success: false,
    });
  }
});

// Get Routes
userRouter.get("/batches", async (req: Request, res: Response) => {
  try {
    const batchesData: Array<object> = [];
    if (req.session.userData.userType == "farmer") {
      (
        await batchCollection
          .where("farmerId", "==", req.session.userData.outletId)
          .get()
      ).docs.forEach((doc) => {
        batchesData.push({ ...doc.data(), batchId: doc.id });
      });
    } else if (req.session.userData.userType == "seller") {
      (
        await batchCollection
          .where("sellerId", "==", req.session.userData.outletId)
          .get()
      ).docs.forEach((doc) => {
        batchesData.push({ ...doc.data(), batchId: doc.id });
      });
    } else if (req.session.userData.userType == "distributor") {
      (
        await batchCollection
          .where("distributorId", "==", req.session.userData.outletId)
          .get()
      ).docs.forEach((doc) => {
        batchesData.push({ ...doc.data(), batchId: doc.id });
      });
    }
    res.status(200).json({ batches: batchesData, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting batches",
      error: error.message,
      success: false,
    });
  }
});

userRouter.get("/sold-batches", async (req: Request, res: Response) => {
  try {
    const batchesData: Array<object> = [];
    if (req.session.userData.userType == "farmer") {
      (
        await batchCollection
          .where("farmerId", "==", req.session.userData.outletId)
          .where("distributorId", "!=", "null")
          .get()
      ).docs.forEach((doc) => {
        batchesData.push({ ...doc.data(), batchId: doc.id });
      });
    } else if (req.session.userData.userType == "distributor") {
      (
        await batchCollection
          .where("distributorId", "==", req.session.userData.outletId)
          .where("sellerId", "!=", "null")
          .get()
      ).docs.forEach((doc) => {
        batchesData.push({ ...doc.data(), batchId: doc.id });
      });
    }
    res.status(200).json({ batches: batchesData, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting sold batches",
      error: error.message,
      success: false,
    });
  }
});

userRouter.get("/current/requests", async (req: Request, res: Response) => {
  try {
    if (req.session.userData.userType != "farmer") {
      return res
        .status(401)
        .json({ message: "Only a farmer can make this request" });
    }
    const reports: Array<object> = [];
    (
      await farmReportsCollection
        .where("farmId", "==", req.session.userData.outletId)
        .where("submitted", "==", false)
        .get()
    ).docs.forEach((doc) => {
      reports.push({ ...doc.data(), reportId: doc.id });
    });

    res.status(200).json({ reports: reports, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting current requests",
      error: error.message,
      success: false,
    });
  }
});
