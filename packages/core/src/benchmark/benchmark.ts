import { performance } from 'perf_hooks';
import { PrivateKey, PublicKey } from 'o1js';
import fs from 'fs/promises';
import { createVotes } from './createVotes.js';
import { aggregateVotes } from './aggregateVotes.js';

async function clearDatabaseAndFiles() {
  try {
    await fs.rm('./votersRoot.json', { force: true });
    await fs.rm('./voteProofs.json', { force: true });
    await fs.rm('./voteAggregatorVerificationKey.json', { force: true });
    console.log('All related files removed.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

function formatMemoryUsage(usage: NodeJS.MemoryUsage) {
  return {
    rssMB: Math.round(usage.rss / 1024 / 1024),
    heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
    externalMB: Math.round((usage.external ?? 0) / 1024 / 1024),
  };
}

async function runSingleBenchmark(numVoters: number) {
  let votersList: Array<[PrivateKey, PublicKey]> = [];

  for (let i = 0; i < numVoters; i++) {
    const electionPrivateKey = PrivateKey.random();
    votersList.push([electionPrivateKey, electionPrivateKey.toPublicKey()]);
  }

  const electionPrivateKey = PrivateKey.random();
  const electionPublicKey = electionPrivateKey.toPublicKey();

  console.log(`\n=== Starting benchmark for ${numVoters} voters ===`);

  const voteStart = performance.now();
  const castVoteBenchmarks = await createVotes(electionPrivateKey, votersList);
  const voteEnd = performance.now();
  const voteTimeMs = voteEnd - voteStart;
  console.log(`Time spent generating proofs: ${voteTimeMs.toFixed(2)} ms`);

  const memAfterVotes = process.memoryUsage();
  console.log(
    'Memory usage after vote proofs:',
    formatMemoryUsage(memAfterVotes)
  );

  const aggStart = performance.now();
  const { verifyPerformances, aggregatePerformances } = await aggregateVotes(
    electionPublicKey
  );
  const aggEnd = performance.now();
  const aggTimeMs = aggEnd - aggStart;
  console.log(`Time spent aggregating proofs: ${aggTimeMs.toFixed(2)} ms`);

  const memAfterAgg = process.memoryUsage();
  console.log(
    'Memory usage after aggregation:',
    formatMemoryUsage(memAfterAgg)
  );

  return {
    numVoters,
    voteTimeMs,
    aggTimeMs,
    verifyPerformances,
    aggregatePerformances,
    memAfterVotes: formatMemoryUsage(memAfterVotes),
    memAfterAgg: formatMemoryUsage(memAfterAgg),
  };
}

async function runBenchmarks() {
  const testSizes = [50, 100, 500, 1000];

  const allResults = [];
  for (const size of testSizes) {
    await clearDatabaseAndFiles();

    const result = await runSingleBenchmark(size);
    allResults.push(result);

    await fs.writeFile(
      `benchmark_results_${size}.json`,
      JSON.stringify(result, null, 2)
    );
  }

  console.log('\n=== All Benchmarks Complete ===');
  console.table(
    allResults.map((r) => ({
      Voters: r.numVoters,
      'ProofGen (ms)': r.voteTimeMs.toFixed(2),
      'Agg (ms)': r.aggTimeMs.toFixed(2),
      'Mem after Votes (MB)': r.memAfterVotes.heapUsedMB,
      'Mem after Agg (MB)': r.memAfterAgg.heapUsedMB,
    }))
  );

  await fs.writeFile(
    'benchmark_summary.json',
    JSON.stringify(allResults, null, 2)
  );

  console.log('Benchmarking finished.');
  process.exit(0);
}

runBenchmarks();
