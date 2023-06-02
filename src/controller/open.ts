import { Request, Response, Router } from "express";
import { ResponseCodes } from "../lib/utils";
import { UserReports } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import { userCollection, userReportsCollection } from "../services/initDb";

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
