import { Request, Response, Router } from "express";
import { Distributor, Farmer, Seller, User } from "../models";
import {
  checkUserAlreadyExist,
  createUser,
  getHealthWorker,
  getUser,
} from "../services/auth.service";
import {
  db,
  distributorCollection,
  farmerCollection,
  sellerCollection,
  userCollection,
} from "../services/initDb";
import {
  validateDistributorData,
  validateFarmerData,
  validateSellerData,
} from "../validations";
import { ResponseCodes } from "../lib/utils";

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
      firebaseAuthUid: req.session.userData.firebaseAuthUid,
    };

    await checkUserAlreadyExist(user);
    const createdUser: string = await createUser(user);
    if (createdUser) {
      try {
        const farmer: Farmer = {
          farmName: farmName,
          userId: db.doc("Users/" + createdUser),
          latitude: Number(latitude),
          longitude: Number(longitude),
          infected: false
        };

        const addedFarmer = await farmerCollection.add(farmer);
        !addedFarmer
          ? res.status(500).json({
              message: "Farmer creation failed",
              success: false,
              resCode: ResponseCodes.CREATION_FAILED,
            })
          : res.status(200).json({
              message: "Created Farmer",
              userId: createdUser,
              farmId: addedFarmer.id,
              success: true,
              resCode: ResponseCodes.CREATED,
            });
      } catch (error) {
        await db.doc(`Users/${createdUser}`).delete();
        throw new Error(error);
      }
    } else {http://localhost:8080/api/user/create/batch
      res.status(500).json({
        message: "User creation failed",
        success: false,
        resCode: ResponseCodes.CREATION_FAILED,
      });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating farmer",
      receivedData: req.body,
      error: error.message,
      success: false,
      resCode: ResponseCodes.CREATION_FAILED,
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
    const data = validateDistributorData(req.body);

    const user: User = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: Number(data.phoneNumber),
      outletAddress: data.outletAddress,
      type: "distributor",
      firebaseAuthUid: req.session.userData.firebaseAuthUid,
    };

    await checkUserAlreadyExist(user);
    const createdUser: string = await createUser(user);
    if (createdUser) {
      try {
        const distributor: Distributor = {
          distributorName: data.distributorName,
          userId: db.doc("Users/" + createdUser),
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          infected: false
        };

        const addedDistributor = await distributorCollection.add(distributor);
        !addedDistributor
          ? res
              .status(500)
              .json({ message: "Distributor creation failed", success: false })
          : res.status(200).json({
              message: "Created distributor",
              userId: createdUser,
              distributorId: addedDistributor.id,
              success: true,
            });
      } catch (error) {
        await db.doc(`Users/${createdUser}`).delete();
        throw new Error(error);
      }
    } else {
      res.status(500).json({ message: "User creation failed", success: false });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating distributor",
      receivedData: req.body,
      error: error.message,
      success: false,
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
    const data = validateSellerData(req.body);

    const user: User = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: Number(data.phoneNumber),
      outletAddress: data.outletAddress,
      type: "seller",
      firebaseAuthUid: req.session.userData.firebaseAuthUid,
    };

    await checkUserAlreadyExist(user);
    const createdUser: string = await createUser(user);
    if (createdUser) {
      try {
        const seller: Seller = {
          sellerShopName: data.sellerShopName,
          userId: db.doc("Users/" + createdUser),
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          infected: false
        };

        const addedSeller = await sellerCollection.add(seller);
        !addedSeller
          ? res
              .status(500)
              .json({ message: "Seller creation failed", success: false })
          : res.status(200).json({
              message: "Created Seller",
              userId: createdUser,
              sellerId: addedSeller.id,
              success: true,
            });
      } catch (error) {
        await db.doc(`Users/${createdUser}`).delete();
        throw new Error(error);
      }
    } else {
      res.status(500).json({ message: "User creation failed", success: false });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Error while creating seller",
      receivedData: req.body,
      error: error.message,
      success: false,
    });
  }
});

// This route will be used to login the user and create a session.
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.session.userData.firebaseAuthUid);
    if (user.data().type == "farmer") {
      console.log(`Users/${user.id}`);
      req.session.userData = {
        ...req.session.userData,
        loggedIn: true,
        userId: user.id,
        userType: user.data().type,
        outletId: (
          await farmerCollection
            .where("userId", "==", db.doc(`Users/${user.id}`))
            .get()
        ).docs[0].id,
      };
    } else if (user.data().type == "distributor") {
      req.session.userData = {
        ...req.session.userData,
        loggedIn: true,
        userId: user.id,
        userType: user.data().type,
        outletId: (
          await distributorCollection
            .where("userId", "==", db.doc(`Users/${user.id}`))
            .get()
        ).docs[0].id,
      };
    } else if (user.data().type == "seller") {
      req.session.userData = {
        ...req.session.userData,
        loggedIn: true,
        userId: user.id,
        userType: user.data().type,
        outletId: (
          await sellerCollection
            .where("userId", "==", db.doc(`Users/${user.id}`))
            .get()
        ).docs[0].id,
      };
    }
    return res.status(200).json({ user: user.data(), success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while logging in",
      error: error.message,
      success: false,
    });
  }
});

// This route is used to log the health worker in.
authRouter.post("/login/health-worker", async (req: Request, res: Response) => {
  try {
    const user = await getHealthWorker(req.session.userData.firebaseAuthUid);

    req.session.userData = {
      ...req.session.userData,
      loggedIn: true,
      userId: user.id,
      userType: "health-worker",
    };

    return res.status(200).json({ user: user.data(), success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while logging in",
      error: error.message,
      success: false,
    });
  }
});
