import { Request, Response, Router } from "express";
import { ResponseCodes } from "../lib/utils";
import { User, UserReports } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import { userCollection, userReportsCollection } from "../services/initDb";
import { firestore } from "firebase-admin";

export const openRouter = Router();

/**
 * This route will be open and can be used
 * by anyone to submit a flu report in a locality
 *
 * {
 *  reporterName: string,
 *  phoneNumber: number,
 *  poultryShop: string,
 *  symptomStartDate: Date,
 *  address: string,
 *  poultryShopName: string,
 *  poultryShopDocId: string
 * }
 */
openRouter.post("/submit-flu-report", async (req: Request, res: Response) => {
  try {
    console.log(req.body.poultryShopName);
    const userReport: UserReports = {
      reporterName: req.body.reporterName,
      phoneNumber: Number(req.body.phoneNumber),
      address: req.body.address,
      cords:req.body.cords,
      createdAt: Timestamp.now(),
      poultryShopName: req.body.poultryShopName,
      poultryShopDocId: req.body.poultryShopDocId,
      symptomStartDate: new Date(req.body.symptomStartDate),
    };

    const addedReportDocRef = await userReportsCollection.add(userReport);
    !addedReportDocRef
      ? res.status(ResponseCodes.CREATION_FAILED).json({
          message: "Report generation failed",
          success: false,
          resCode: ResponseCodes.CREATION_FAILED,
        })
      : res.status(ResponseCodes.CREATED).json({
          message: "Successfully generated report",
          success: true,
          resCode: ResponseCodes.CREATED,
        });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while submitting flu",
      success: false,
      resCode: ResponseCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
});

openRouter.get("/seller-shops", async (req: Request, res: Response) => {
  try {
    const sellerResult: Array<{ label: string; key: string }> = [];
    const sellers = await userCollection.where("type", "==", "seller").get();
    await Promise.all(
      sellers.docs.map((doc) => {
        sellerResult.push({
          key: doc.id,
          label: doc.data().outletName,
        });
      })
    );

    res.status(200).json({ sellers: sellerResult, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting seller shops",
      success: false,
      resCode: ResponseCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
});

openRouter.get(
  "/infected-stakeholders",
  async (req: Request, res: Response) => {
    try {
      const infectedUsers: {
        farmer: Array<Object>;
        seller: Array<Object>;
        distributor: Array<Object>;
      } = { farmer: [], distributor: [], seller: [] };

      const users = (await userCollection.where("infected", "==", true).get())
        .docs;

      await Promise.all(
        users.map((user) => {
          const data = user.data();
          // Reflect.deleteProperty(data, "userId")
          switch (user.data().type) {
            case "farmer":
              infectedUsers.farmer.push(data);
              break;
            case "distributor":
              infectedUsers.distributor.push(data);
              break;
            case "seller":
              infectedUsers.seller.push(data);
              break;
          }
        })
      );

      res
        .status(200)
        .json({ message: "Got infected stakeholders", infectedUsers });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while getting infected stakeholders",
        success: false,
        resCode: ResponseCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }
);

openRouter.get("/stakeholders", async (req: Request, res: Response) => {
  try {
    const infectedUsers: {
      farmer: Array<Object>;
      seller: Array<Object>;
      distributor: Array<Object>;
    } = { farmer: [], distributor: [], seller: [] };

    const users = (await userCollection.get()).docs;

    await Promise.all(
      users.map((user) => {
        const data = user.data();
        // Reflect.deleteProperty(data, "userId")
        switch (user.data().type) {
          case "farmer":
            infectedUsers.farmer.push(data);
            break;
          case "distributor":
            infectedUsers.distributor.push(data);
            break;
          case "seller":
            infectedUsers.seller.push(data);
            break;
        }
      })
    );

    res
      .status(200)
      .json({ message: "Got stakeholders", infectedUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting stakeholders",
      success: false,
      resCode: ResponseCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
});

openRouter.get("/active-cases", async (req: Request, res: Response) => {
  try {
    const activeCases: Array<firestore.DocumentData> = [];
    const infectedSellers = await userCollection
      .where("infected", "==", true)
      .get();

    await Promise.all(
      infectedSellers.docs.map(async (infectedSeller) => {
        const userReports = await userReportsCollection
          .where("poultryShopDocId", "==", infectedSeller.id)
          .get();

        await Promise.all(
          userReports.docs.map((doc) => {
            activeCases.push(doc.data());
          })
        );
      })
    );

    return res
      .status(200)
      .json({ activeCases: { count: activeCases.length, users: activeCases } });
  } catch (error) {
    res.status(500).json({
      message: "Error while getting seller shops",
      success: false,
      resCode: ResponseCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
});
