import bodyParser from 'body-parser';
import cluster from 'cluster';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import os from 'os';
import path from 'path';

import electionRouteController from './routes/electionRoute.js';
import voteRouteController from './routes/voteRoute.js';

dotenv.config({ path: path.join(import.meta.dirname, '.env') });

const CLUSTER_COUNT = Number(process.env.WEB_CONCURRENCY) || os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < CLUSTER_COUNT; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);

    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
  const PORT = process.env.PORT || 3000;

  mongoose.set('strictQuery', false);
  mongoose.connect(MONGODB_URI);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    if (!req.query || typeof req.query != 'object') req.query = {};
    if (!req.body || typeof req.body != 'object') req.body = {};

    next();
  });

  app.use('/election', electionRouteController);
  app.use('/vote', voteRouteController);

  server.listen(PORT, () => {
    console.log(`Server is on port ${PORT} as Worker ${cluster.worker?.id} running @ process ${cluster.worker?.process.pid}`);
  });
}
