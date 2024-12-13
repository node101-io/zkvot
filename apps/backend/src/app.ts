import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import path from 'path';

import blockInfoRouteController from './routes/blockInfoRoute.js';
import electionRouteController from './routes/electionRoute.js';
import voteRouteController from './routes/voteRoute.js';

import Vote from './models/vote/Vote.js';

import { compileZkProgramIfNotCompiledBefore } from './utils/mina/compileZkProgram.js';

dotenv.config({ path: path.join(import.meta.dirname, '../.env') });

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)
  console.error('AWS_ACCESS_KEY_ID and / or AWS_SECRET_ACCESS_KEY environment variables not set');

const app = express();
const server = http.createServer(app);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
const PORT = process.env.PORT || 8000;

mongoose.set('strictQuery', false);
await mongoose.connect(MONGODB_URI);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => callback(null, true)
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
});