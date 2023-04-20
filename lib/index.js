"use strict";
// import * as functions from "firebase-functions";
Object.defineProperty(exports, "__esModule", { value: true });
// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
//import libraries
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const port = 8080;
//initialize firebase inorder to access its services
admin.initializeApp(functions.config().firebase);
//initialize express server
const app = express();
var server = http.createServer(app);
const main = express();
//add the path to receive request and set json as bodyParser to process the body 
main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));
//initialize the database and the collection 
//const db = admin.firestore();
//const userCollection = 'users';
server.listen(port, () => {
    console.log(`Started server on port ${port}`);
});
//# sourceMappingURL=index.js.map