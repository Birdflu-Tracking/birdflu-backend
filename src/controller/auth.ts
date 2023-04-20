import { Request, Response, Router } from "express";
import {Farmer, User} from "../models";

export const authRouter = Router();

/**
* This will be used to create a user -> farmer | distributor | seller
*
* {
* 	firstName: string,
* 	lastName: string,
* 	email: string,
* 	phoneNumber: number,
* 	outletName: string,
* 	outletAddress: string,
* }
* */
authRouter.post("/create/farmer", async (req: Request, res: Response) => {
	const user: User = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		phoneNumber: Number(req.body.phoneNumber),
		outletName: req.body.outletName,
		outletAddress: req.body.outletAddress,
		type: "farmer"
	}

	const farmer: Farmer = {
		farmName: req.body.farmName,
		userId: "",
		latitude: Number(req.body.latitude),
		longitude: Number(req.body.longitude)
	}
})

authRouter.post("/login", async () => {
})

authRouter.post("/logout", async () => {
})
