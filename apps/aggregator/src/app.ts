import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

import proveRouteController from './routes/proveRoute.js';

import { compileZkProgramIfNotCompiledBefore } from './utils/compileZkProgram.js';

import { Vote } from 'zkvot-backend-utils';

if (!process.env.MONGODB_URI)
  console.warn('MONGODB_URI env variable not set');

const PORT = 8001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';

await mongoose.connect(MONGODB_URI);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use((req, res, next) => {
  if (!req.query || typeof req.query != 'object') req.query = {};
  if (!req.body || typeof req.body != 'object') req.body = {};

  return next();
});

app.use('/prove', proveRouteController);

server.listen(PORT, async () => {
  console.log(`Server is on port ${PORT}.`);

  await compileZkProgramIfNotCompiledBefore();

  Vote.countVotesRecursively();
});
