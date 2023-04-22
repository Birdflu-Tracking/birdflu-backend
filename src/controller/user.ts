import { Request, Response, Router } from "express";

export const userRouter = Router();

userRouter.post("/logout", async (req: Request, res: Response) => {
  console.log(req.session.userData)
  if (!req.session.userData.loggedIn)
    return res.status(401).send("User not logged in")

  req.session.destroy(() => {
    console.log("Destroyed")
    res.status(200).send("Logged out successfully")
  })
});