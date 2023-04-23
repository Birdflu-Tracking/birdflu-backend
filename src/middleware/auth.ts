import { Request, Response, NextFunction } from "express";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.session.userData = {
      /**
       * will be taken from firebase auth
       * These are temperory users created for testing until authentication is done
       * "seller_user323948" "farmer_user323948" "distributor_user323948" "health_user323948"
       */
      firebaseAuthUid: "farmer_user323948", //
      loggedIn: false,
      userId: null,
      outletId: null,
      userType: null,
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error while loggin in user" });
  }
};

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session.userData.loggedIn) {
      console.log(`Logged in as ${req.session.userData.userType}`);
      next();
    } else {
      res
        .status(440)
        .json({ message: "User session expired, please login again" });
    }
  } catch (error) {
    console.log(error);
    !req.session.userData
      ? res
          .status(440)
          .json({ message: "User session expired, please login again" })
      : res.status(400).json({ error: "Couldn't find user." });
  }
};
