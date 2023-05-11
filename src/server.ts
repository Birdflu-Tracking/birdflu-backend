import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import * as http from "http";
import { FirestoreStore } from "@google-cloud/connect-firestore";
import { userRouter } from "./controller/user";
import { authRouter } from "./controller/auth";
import { healthWorkerRouter } from "./controller/healthWorker";
import session = require("express-session");
import { db } from "./services/initDb";
import { auth, verifyUser } from "./middleware/auth";
import { openRouter } from "./controller/open";

const port = 8080;
const app = express();
var server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(
  session({
    store: new FirestoreStore({
      dataset: db,
      kind: "Sessions",
    }),
    secret: "bird-flu",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
  })
);

server.listen(port, async () => {
  app.use("/api/auth", auth, authRouter);
  app.use("/api/user", verifyUser, userRouter);
  app.use("/api/health-worker", verifyUser, healthWorkerRouter);
  app.use("/open", openRouter);

  console.log(`Started server on port ${port}`);
});
