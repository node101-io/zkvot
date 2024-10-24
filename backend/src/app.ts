import cluster from "cluster";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import os from "os";
import path from "path";

import electionRouteController from "./routes/electionRoute.js";
import voteRouteController from "./routes/voteRoute.js";

import { compileZkProgramIfNotCompiledBefore } from "./utils/compileZkProgram.js";

dotenv.config({ path: path.join(import.meta.dirname, "../.env") });

const CLUSTER_COUNT = Number(process.env.WEB_CONCURRENCY) || os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < CLUSTER_COUNT; i++) cluster.fork();

  cluster.on("exit", (worker, _code, _signal) => {
    console.log(`worker ${worker.process.pid} died`);

    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);

  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zkVot";
  const PORT = process.env.PORT || 3000;

  mongoose.set("strictQuery", false);
  mongoose.connect(MONGODB_URI);

  app.use(express.json());
  app.use((req, _res, next) => {
    if (!req.query || typeof req.query != "object") req.query = {};
    if (!req.body || typeof req.body != "object") req.body = {};

    return next();
  });

  app.use("/api/election", electionRouteController);
  app.use("/api/vote", voteRouteController);
  app.use("/app", (_req, res) => res.redirect("http://localhost:10101"));

  server.listen(PORT, () => {
    console.log(`Server is on port ${PORT} as Worker`);

    compileZkProgramIfNotCompiledBefore(false);
  });
}
