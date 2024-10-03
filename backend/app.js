const bodyParser = require('body-parser');
const cluster = require('cluster');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const CLUSTER_COUNT = process.env.WEB_CONCURRENCY || require('os').cpus().length;

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

  const MAX_QUERY_LIMIT = 1e3;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zkVot';
  const PORT = process.env.PORT || 3000;
  const QUERY_LIMIT = 20;

  mongoose.set('strictQuery', false);
  mongoose.connect(MONGODB_URI);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    if (!req.query || typeof req.query != 'object') req.query = {};
    if (!req.body || typeof req.body != 'object') req.body = {};

    if (!req.query.limit || isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) < 1 || parseInt(req.query.limit) > MAX_QUERY_LIMIT) {
      res.locals.QUERY_LIMIT = QUERY_LIMIT;
      req.query.limit = QUERY_LIMIT;
    } else {
      res.locals.QUERY_LIMIT = parseInt(req.query.limit);
      req.query.limit = parseInt(req.query.limit);
    }

    next();
  });

  const electionRouter = require('./routes/election');

  app.use('/election', electionRouter);

  server.listen(PORT, () => {
    console.log(`Server is on port ${PORT} as Worker ${cluster.worker.id} running @ process ${cluster.worker.process.pid}`);    
  });
}
