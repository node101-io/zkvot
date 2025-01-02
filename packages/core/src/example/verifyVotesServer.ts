// import { Field, PublicKey, verify } from 'o1js';
// import fs from 'fs/promises';

// import Aggregation from '../Aggregation.js';
// import AggregationTree from '../AggregationTree.js';
// import Vote from '../Vote.js';

// export const verifyVotes = async () => {

// };

import cluster from 'cluster';
import { JsonProof, verify } from 'o1js';
import os from 'os';
import { performance } from 'perf_hooks';
import http from 'http';

import Vote from '../Vote.js';

const numCPUs = os.cpus().length;

const verifyVote = async (voteProof: JsonProof) => {
  const start = performance.now();

  const verified = await verify(voteProof, Vote.verificationKey);

  return {
    isVerified: verified,
    timeTaken: performance.now() - start // Time in milliseconds
  };
};

if (cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running`);
  console.log(`Forking server for ${numCPUs} CPUs...\n`);

  for (let i = 0; i < numCPUs; i++)
    cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace dead worker
  });
} else {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/verify') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        const voteProof = JSON.parse(body); // Parse incoming proof data

        const { isVerified, timeTaken } = await verifyVote(voteProof);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ timeTaken: timeTaken.toFixed(2), isVerified }));
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    };
  });

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} is listening on http://localhost:${3000}`);
  });
}
