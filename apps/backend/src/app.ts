import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

// import Job from './cron/Job.js';

import blockInfoRouteController from './routes/blockInfoRoute.js';
import electionRouteController from './routes/electionRoute.js';
import voteRouteController from './routes/voteRoute.js';

const app = express();
const server = http.createServer(app);

if (!process.env.MONGODB_URI)
  console.warn('MONGODB_URI env variable not set');

if (!process.env.AWS_ACCESS_KEY_ID)
  console.warn('AWS_ACCESS_KEY_ID env variable not set');
if (!process.env.AWS_SECRET_ACCESS_KEY)
  console.warn('AWS_SECRET_ACCESS_KEY env variable not set');

if (!process.env.AVAIL_SEED_PHRASE_DEVNET)
  console.warn('AVAIL_SEED_PHRASE_DEVNET env variable not set');
if (!process.env.AVAIL_SEED_PHRASE_MAINNET)
  console.warn('AVAIL_SEED_PHRASE_MAINNET env variable not set');

if (!process.env.CELESTIA_AUTH_TOKEN_TESTNET)
  console.warn('CELESTIA_AUTH_TOKEN_TESTNET env variable not set');
if (!process.env.CELESTIA_AUTH_TOKEN_MAINNET)
  console.warn('CELESTIA_AUTH_TOKEN_MAINNET env variable not set');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
const PORT = process.env.PORT || 8000;

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

  // Job.start();
});
