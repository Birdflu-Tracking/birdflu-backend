import { Request, Response, NextFunction } from "express";
import { admin } from "../services/initDb";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const idToken = req.body.idToken;
    console.log(`ID-TOKEN: ${idToken}`);

    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn: 1000 * 60 * 60 * 24 })
      .then(async (sessionCookie) => {
        console.log(`SESSION_COOKIE: ${sessionCookie}`);
        req.session.userData = {
          firebaseAuthUid: (await admin.auth().verifyIdToken(idToken)).uid,
          sessionCookie: sessionCookie,
          loggedIn: false,
          userDocId: null,
          userType: null,
        };

        next();
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error while loggin in user" });
  }
};

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`SESSION_COOKIE: ${req.session.userData.sessionCookie}`);
    admin
      .auth()
      .verifySessionCookie(req.session.userData.sessionCookie)
      .then((res) => {
        next();
      });
  } catch (error) {
    console.log(error);
    !req.session.userData
      ? res
          .status(440)
          .json({ message: "User session expired, please login again" })
      : res.status(400).json({ error: "Couldn't find user." });
  }
};
