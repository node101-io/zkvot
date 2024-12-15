import cors from 'cors';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

import 'dotenv/config';

// import Job from './cron/Job.js';

import blockInfoRouteController from './routes/blockInfoRoute.js';
import electionRouteController from './routes/electionRoute.js';
import voteRouteController from './routes/voteRoute.js';

import { compileZkProgramIfNotCompiledBefore } from './utils/mina/compileZkProgram.js';

const app = express();
const server = http.createServer(app);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
const PORT = process.env.PORT || 8000;

mongoose.set('strictQuery', false);
await mongoose.connect(MONGODB_URI);

app.use(express.json());
app.use(cors({
  origin: (_origin, callback) => callback(null, true)
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
  console.log(`Server is on port ${PORT}.`);

  compileZkProgramIfNotCompiledBefore(false);

  // Job.start();
});
