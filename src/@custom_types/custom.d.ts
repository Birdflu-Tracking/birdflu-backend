import "express-session";
import { UserType } from "../lib/commons";

type BirdFluTrackerUserSession = {
  userId: string;
  outletId: string;
  firebaseAuthUid: string;
  userType: UserType;
  loggedIn: boolean;
};

declare module "express-session" {
  interface SessionData {
    userData: BirdFluTrackerUserSession;
  }
}
