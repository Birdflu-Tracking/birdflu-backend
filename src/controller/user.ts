import { Request, Response, Router } from "express";
import {
  batchCollection,
  db,
  farmReportsCollection,
  farmerCollection,
} from "../services/initDb";
import { Batch } from "../models";
import { isBatchOwnedbyUser, transferBatch } from "../services/user.service";

export const userRouter = Router();

// POST Routes
userRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    if (!req.session.userData.loggedIn)
      return res.status(401).send("User not logged in");

    req.session.destroy(() => {
      console.log("Destroyed");
      res.status(200).send("Logged out successfully");
    });
  } catch (error) {
    res.status(401).send("User not logged in");
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
        })
      : res
          .status(200)
          .json({ message: "Batch created successfully", data: batch });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating batch",
      error: error.message,
    });
  }
});

/**
 * This route will be used to transfer a batch.
 * Either from farmer to distributor or distributor to seller.
 *
 * {
 *  batchId: string,
 *  distributorId: string | null,
 *  sellerId: string | null
 * }
 */
userRouter.post("/transfer/batch", async (req: Request, res: Response) => {
  try {
    const { batchId, distributorId, sellerId } = req.body;
    const batchData = (await batchCollection.doc(batchId).get()).data();

    if (!batchData.distributorId || !batchData.sellerId) {
      await isBatchOwnedbyUser(batchData, req.session.userData.userId);
      const transferredBatch = await transferBatch(
        distributorId,
        sellerId,
        req.session.userData.userId,
        batchId
      );
      !transferredBatch
        ? res.status(500).json({ message: "Error while transferring batch" })
        : res.status(200).json({ message: "Transferred batch successfully" });
    } else {
      throw new Error("Batch is already transfered");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while transfering batch",
      error: error.message,
    });
  }
});

userRouter.post("/farmer/report", async (req: Request, res: Response) => {
  try {
    res.send("NOT IMPLEMENTED: Farmer report symptoms");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while reporting symptoms",
      error: error.message,
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
        batchesData.push(doc.data());
      });
    } else if (req.session.userData.userType == "seller") {
      (
        await batchCollection
          .where("sellerId", "==", req.session.userData.outletId)
          .get()
      ).docs.forEach((doc) => {
        batchesData.push(doc.data());
      });
    } else if (req.session.userData.userType == "distributor") {
      (
        await batchCollection
          .where("distributor", "==", req.session.userData.outletId)
          .get()
      ).docs.forEach((doc) => {
        batchesData.push(doc.data());
      });
    }
    res.status(200).json({ batches: batchesData });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting batches",
      error: error.message,
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
        batchesData.push(doc.data());
      });
    } else if (req.session.userData.userType == "distributor") {
      (
        await batchCollection
          .where("distributorId", "==", req.session.userData.outletId)
          .where("sellerId", "!=", "null")
          .get()
      ).docs.forEach((doc) => {
        batchesData.push(doc.data());
      });
      console.log("here");
    }
    res.status(200).json({ batches: batchesData });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting sold batches",
      error: error.message,
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
      reports.push(doc.data());
    });

    res.status(200).json({ reports: reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting current requests",
      error: error.message,
    });
  }
});
