import express from 'express';
import http from 'http';

import proveRouteController from './routes/proveRoute.js';

import { compileZkProgramIfNotCompiledBefore } from './utils/compileZkProgram.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use((req, res, next) => {
  if (!req.query || typeof req.query != 'object') req.query = {};
  if (!req.body || typeof req.body != 'object') req.body = {};

  return next();
});

app.use('/prove', proveRouteController);

server.listen(PORT, () => {
  console.log(`Server is on port ${PORT} as Worker`);

  compileZkProgramIfNotCompiledBefore(false);
});
