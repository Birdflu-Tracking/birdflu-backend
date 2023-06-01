import "express-session";
import { UserType } from "../lib/commons";

type BirdFluTrackerUserSession = {
  userDocId: string;
  sessionCookie: string;
  firebaseAuthUid: string;
  userType: UserType;
  loggedIn: boolean;
};

declare module "express-session" {
  interface SessionData {
    userData: BirdFluTrackerUserSession;
  }
}
