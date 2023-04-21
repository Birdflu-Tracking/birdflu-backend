import * as express from "express";
import * as bodyParser from "body-parser";
import * as http from "http";
import { userRouter } from "./controller/user";
import { authRouter } from "./controller/auth";
import { healthWorkerRouter } from "./controller/healthWorker";

const port = 8080;
const app = express();
var server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

server.listen(port, async () => {
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/health-worker", healthWorkerRouter);

  console.log(`Started server on port ${port}`);
});
