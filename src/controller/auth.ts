import { Request, Response, Router } from "express";
import { HealthWorker, User } from "../models";
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
  healthWorkerCollection,
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
      outletName,
      latitude,
      longitude,
    } = validateFarmerData(req.body);

    const user: User = {
      userId: req.session.userData.firebaseAuthUid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: Number(phoneNumber),
      outletAddress: outletAddress,
      type: "farmer",
      outletName,
      latitude: Number(latitude),
      longitude: Number(longitude),
      infected: false,
    };

    await checkUserAlreadyExist(user);
    const createdUser: string = await createUser(user);
    if (createdUser) {
      res.status(200).json({
        message: "Created user successfully",
        userId: createdUser,
        success: false,
      });
    } else {
      res.status(500).json({ message: "User creation failed", success: false });
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
      userId: req.session.userData.firebaseAuthUid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: Number(data.phoneNumber),
      outletAddress: data.outletAddress,
      type: "distributor",
      outletName: data.outletName,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      infected: false,
    };

    await checkUserAlreadyExist(user);
    const createdUser: string = await createUser(user);
    if (createdUser) {
      res
        .status(200)
        .json({ message: "Created user successfully", success: true });
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
      userId: req.session.userData.firebaseAuthUid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: Number(data.phoneNumber),
      outletAddress: data.outletAddress,
      type: "seller",
      outletName: data.outletName,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      infected: false,
    };

    await checkUserAlreadyExist(user);
    const createdUser: string = await createUser(user);
    if (createdUser) {
      res
        .status(200)
        .json({ message: "Created user successfully", success: true });
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

/**
 * This will be used to create a health worker
 *
 * {
 *  email: string,
 * firstName: string,
 * lastName: string,
 * phoneNumber: string,
 * }
 **/
authRouter.post(
  "/create/health-worker",
  async (req: Request, res: Response) => {
    try {
      const healthWorker: HealthWorker = {
        assignedAt: new Date(),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.lastName,
        userId: req.session.userData.firebaseAuthUid,
      };

      const createdHealthWorker = await healthWorkerCollection.add(
        healthWorker
      );
      if (createdHealthWorker.id) {
        res
          .status(200)
          .json({
            message: "Created health worker successfully",
            success: true,
          });
      } else {
        res
          .status(500)
          .json({ message: "Health worker creation failed", success: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while creating seller",
        receivedData: req.body,
        error: error.message,
        success: false,
      });
    }
  }
);

// This route will be used to login the user and create a session.
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.session.userData.firebaseAuthUid);
    if (user.data().type == "farmer") {
      console.log(`Users/${user.id}`);
      req.session.userData = {
        ...req.session.userData,
        loggedIn: true,
        userDocId: user.id,
        userType: user.data().type,
      };
    } else if (user.data().type == "distributor") {
      req.session.userData = {
        ...req.session.userData,
        loggedIn: true,
        userDocId: user.id,
        userType: user.data().type,
      };
    } else if (user.data().type == "seller") {
      req.session.userData = {
        ...req.session.userData,
        loggedIn: true,
        userDocId: user.id,
        userType: user.data().type,
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
      userDocId: user.id,
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
