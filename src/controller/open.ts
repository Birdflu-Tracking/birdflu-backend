import { Request, Response, Router } from "express";
import { ResponseCodes } from "../lib/utils";
import { UserReports } from "../models";
import { Timestamp } from "@google-cloud/firestore";
import { userReportsCollection } from "../services/initDb";

export const openRouter = Router();

/**
 * This route will be open and can be used
 * by anyone to submit a flu report in a locality
 *
 * {
 *  firstName: string,
 *  lastName: string,
 *  phoneNumber: number,
 *  poultryShop: string,
 *  symptomStartDate: Date,
 *  address: string
 * }
 */
openRouter.post("/submit-flu-report", async (req: Request, res: Response) => {
    try {
        const userReport: UserReports = {
            reporterName: req.body.firstName + req.body.lastName,
            phoneNumber: Number(req.body.phoneNumber),
            address: req.body.address,
            createdAt: Timestamp.now(),
            poultryShop: req.body.poultryShop,
            symptomStartDate: new Date(req.body.symptomStartDate),
        };

        const addedReportDocRef = await userReportsCollection.add(userReport);
        !addedReportDocRef
            ? res
                .status(ResponseCodes.CREATION_FAILED)
                .json({
                    message: "Report generation failed",
                    success: false,
                    resCode: ResponseCodes.CREATION_FAILED,
                })
            : res
                .status(ResponseCodes.CREATED)
                .json({
                    message: "Successfully generated report",
                    success: true,
                    resCode: ResponseCodes.CREATED,
                });
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .json({
                message: "Error while submitting flu",
                success: false,
                resCode: ResponseCodes.INTERNAL_SERVER_ERROR,
                error: error.message
            });
    }
});
