import cluster from 'cluster';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import os from 'os';
import path from 'path';

import blockInfoRouteController from './routes/blockInfoRoute.js';
import electionRouteController from './routes/electionRoute.js';
import voteRouteController from './routes/voteRoute.js';

import { compileZkProgramIfNotCompiledBefore } from './utils/compileZkProgram.js';

dotenv.config({ path: path.join(import.meta.dirname, '../.env') });

const numCPUs = process.env.WEB_CONCURRENCY && !isNaN(Number(process.env.WEB_CONCURRENCY)) ? Number(process.env.WEB_CONCURRENCY) : os.cpus().length;

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)
  console.error('AWS_ACCESS_KEY_ID and / or AWS_SECRET_ACCESS_KEY environment variables not set');

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++)
    cluster.fork();

  cluster.on('exit', worker => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });

  compileZkProgramIfNotCompiledBefore(false);
} else {
  const app = express();
  const server = http.createServer(app);

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
  const PORT = process.env.PORT || 8000;

  mongoose.set('strictQuery', false);
  await mongoose.connect(MONGODB_URI);

  app.use(express.json());
  app.use(cors({
    origin: (origin, callback) => {
      return callback(null, true);
      // if (origin === 'http://localhost:3000' || origin === 'https://app.zkvot.io')
      //   return callback(null, true);

      // return callback(new Error('Not allowed by CORS'));
    }
  }));
  app.use((req, res, next) => {
    if (!req.query || typeof req.query != 'object') req.query = {};
    if (!req.body || typeof req.body != 'object') req.body = {};

    return next();
  });

  app.use('/api/block-info', blockInfoRouteController);
  app.use('/api/election', electionRouteController);
  app.use('/api/vote', voteRouteController);

  server.listen(PORT, () => {
    console.log(`Server is on port ${PORT} as Worker ${cluster.worker?.id} running @ process ${cluster.worker?.process.pid}.`);
  });
}