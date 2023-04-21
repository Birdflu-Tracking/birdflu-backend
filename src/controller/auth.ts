import { Request, Response, Router } from "express";
import { Distributor, Farmer, Seller, User } from "../models";
import { createUser } from "../services/auth.service";
import {
  db,
  distributorCollection,
  farmerCollection,
  sellerCollection,
} from "../services/initDb";
import {
  validateDistributorData,
  validateFarmerData,
  validateSellerData,
} from "../validations";

export const authRouter = Router();

/**
 * This will be used to create a farmer
 *
 * {
 * 	firstName: string,
 * 	lastName: string,
 * 	email: string,
 * 	phoneNumber: number,
 * 	outletAddress: string,
 *  farmName: string,
 *  latitude: string,
 *  longitude: string
 * }
 * */
authRouter.post("/create/farmer", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      outletAddress,
      farmName,
      latitude,
      longitude,
    } = validateFarmerData(req.body);

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: Number(phoneNumber),
      outletAddress: outletAddress,
      type: "farmer",
    };

    const createdUser: string = await createUser(user);
    if (createdUser) {
      const farmer: Farmer = {
        farmName: farmName,
        userId: db.doc("users/" + createdUser),
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      const addedFarmer = await farmerCollection.add(farmer);
      !addedFarmer
        ? res.status(500).json({ message: "Farmer creation failed" })
        : res.status(200).json({
            message: "Created Farmer",
            userId: createdUser,
            farmId: addedFarmer.id,
          });
    } else {
      res.status(500).json({ message: "User creation failed" });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating farmer",
      receivedData: req.body,
      error: error.message,
    });
  }
});

/**
 * This will be used to create a distributor
 *
 * {
 * 	firstName: string,
 * 	lastName: string,
 * 	email: string,
 * 	phoneNumber: number,
 * 	outletAddress: string,
 * 	distributorName: string,
 *  latitude: string,
 *  longitude: string
 * }
 * */
authRouter.post("/create/distributor", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      outletAddress,
      distributorName,
      latitude,
      longitude,
    } = validateDistributorData(req.body);

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: Number(phoneNumber),
      outletAddress: outletAddress,
      type: "distributor",
    };

    const createdUser: string = await createUser(user);
    if (createdUser) {
      const distributor: Distributor = {
        distributorName: distributorName,
        userId: db.doc("users/" + createdUser),
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      const addedDistributor = await distributorCollection.add(distributor);
      !addedDistributor
        ? res.status(500).json({ message: "Distributor creation failed" })
        : res.status(200).json({
            message: "Created distributor",
            userId: createdUser,
            distributorId: addedDistributor.id,
          });
    } else {
      res.status(500).json({ message: "User creation failed" });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating distributor",
      receivedData: req.body,
      error: error.message,
    });
  }
});

/**
 * This will be used to create a seller
 *
 * {
 * 	firstName: string,
 * 	lastName: string,
 * 	email: string,
 * 	phoneNumber: number,
 * 	outletAddress: string,
 * 	sellerShopName: string,
 *  latitude: string,
 *  longitude: string
 * }
 * */
authRouter.post("/create/seller", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      outletAddress,
      sellerShopName,
      latitude,
      longitude,
    } = validateSellerData(req.body);

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: Number(phoneNumber),
      outletAddress: outletAddress,
      type: "seller",
    };

    const createdUser: string = await createUser(user);
    if (createdUser) {
      const seller: Seller = {
        sellerShopName: sellerShopName,
        userId: db.doc("users/" + createdUser),
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      const addedSeller = await sellerCollection.add(seller);
      !addedSeller
        ? res.status(500).json({ message: "Seller creation failed" })
        : res.status(200).json({
            message: "Created Seller",
            userId: createdUser,
            sellerId: addedSeller.id,
          });
    } else {
      res.status(500).json({ message: "User creation failed" });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating seller",
      receivedData: req.body,
      error: error.message,
    });
  }
});

authRouter.post("/login", async () => {});

authRouter.post("/logout", async () => {});
