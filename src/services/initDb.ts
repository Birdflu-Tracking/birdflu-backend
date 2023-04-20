import * as admin from "firebase-admin"
var serviceAccount = require("../../birdflu-tracker-firebase-adminsdk-3635x-1d9e2bbf9b.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
})

export const db = admin.firestore();
export const userCollection = db.collection("users")
