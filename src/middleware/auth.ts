import { Request, Response, NextFunction } from "express";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.session.userData = {
            /**
             * will be taken from firebase auth 
             * These are temperory users created for testing until authentication is done
             * "seller_user323948" "farmer_user323948" "distributor_user323948"
            */
            firebaseAuthUid: "distributor_user323948", // 
            loggedIn: false,
            userId: null,
            userType: null
        }

        next()
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error while loggin in user" })
    }
}