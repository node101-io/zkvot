import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import path from 'path';

import blockInfoRouteController from './routes/blockInfoRoute.js';
import electionRouteController from './routes/electionRoute.js';
import voteRouteController from './routes/voteRoute.js';

import { compileZkProgramIfNotCompiledBefore } from './utils/compileZkProgram.js';

dotenv.config({ path: path.join(import.meta.dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
const PORT = process.env.PORT || 8000;

mongoose.set('strictQuery', false);
await mongoose.connect(MONGODB_URI);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (origin === 'http://localhost:3000' || origin === 'https://app.zkvot.io')
      return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
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
  console.log(`Server is on port ${PORT} as Worker`);

  compileZkProgramIfNotCompiledBefore(false);
});
