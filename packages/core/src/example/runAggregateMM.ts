import dotenv from 'dotenv';
import { Level } from 'level';
import { Field, MerkleMap, PublicKey, verify } from 'o1js';
import fs from 'fs/promises';

import Aggregation from '../AggregationMM.js';
import Vote from '../Vote.js';

const db = new Level('./cachedProofsDb', { valueEncoding: 'json' });

dotenv.config();

export const runAggregate = async (electionPubKey: PublicKey) => {
  console.time('Compiling vote program');
  let { verificationKey } = await Vote.Program.compile();
  console.timeEnd('Compiling vote program');

  console.time('Compiling range aggregation program');
  await Aggregation.Program.compile();
  console.timeEnd('Compiling range aggregation program');

  console.log('Reading vote proofs');

  const voteProofsJson = await fs.readFile('voteProofs.json');
  const voteProofs = JSON.parse(voteProofsJson.toString());
  console.log('Vote proofs read, there are', voteProofs.length, 'proofs found');

  console.log('Reading voters root');
  const votersRootJson = await fs.readFile('votersRoot.json');
  const votersRoot = Field.from(JSON.parse(votersRootJson.toString()));
  console.log('Voters root read, voters root:', votersRoot.toString());

  console.log('Checking votes');
  const leaves: [bigint, Vote.Proof][] = [];

  let expectedResults = new Array(21).fill(0);

  for (let i = 0; i < voteProofs.length; i++) {
    const voteProof = await Vote.Proof.fromJSON(voteProofs[i]);

    const nullifier = voteProof.publicOutput.nullifier.toBigInt();

    const leaf: [bigint, Vote.Proof] = [nullifier, voteProof];

    const ok = await verify(leaf[1], verificationKey);

    if (ok) {
      leaves.push(leaf);
      expectedResults[Number(voteProof.publicOutput.vote.toString())]++;
      console.log(
        'Vote proof',
        leaf[1].publicOutput.nullifier.toString(),
        ' is valid, vote for:',
        leaf[1].publicOutput.vote.toString()
      );
    } else {
      console.log('Vote proof is invalid skipping');
      continue;
    }
  }

  console.log('Connecting to database');

  let aggregatorProof: Aggregation.Proof | null = null;
  let cachedNullifiers: bigint[] = [];
  let countedSoFar = 0;
  let merkleMap = new MerkleMap();
  try {
    const storedDataString = await db.get('aggregated_vote_data');

    if (!storedDataString) {
      console.log('No aggregated vote data found');
    } else {
      const storedData = JSON.parse(storedDataString);

      const nullifiersAndVotes: [bigint, number][] = storedData.nullifiers.map(
        (item: { bigIntValue: string; intValue: string }) => {
          return [BigInt(item.bigIntValue), Number(item.intValue)];
        }
      );

      nullifiersAndVotes.forEach((item) => {
        merkleMap.set(Field.from(item[0]), Field.from(item[1]));
      });

      const proofJson = JSON.parse(storedData.proof);
      aggregatorProof = await Aggregation.Proof.fromJSON(proofJson);
      cachedNullifiers = nullifiersAndVotes.map((item) => item[0]);
      countedSoFar = Number(
        aggregatorProof.publicOutput.totalAggregatedCount.toBigInt()
      );
      console.log('Retrieved nullifiers:', cachedNullifiers.length);
      console.log('Proof retrieved');
    }
  } catch (error) {
    console.error('Error retrieving aggregated vote data:', error);
  }

  const remainingNullifiers = leaves.filter(
    (leaf) => !cachedNullifiers.includes(leaf[0])
  );

  if (remainingNullifiers.length === 0) {
    console.log('All votes are already aggregated');
    return;
  }

  if (!aggregatorProof) {
    console.log('No base proof found. Initializing aggregatorProof.');
    const witness = merkleMap.getWitness(Field.from(remainingNullifiers[0][0]));
    aggregatorProof = (
      await Aggregation.Program.base_one(
        { votersRoot, electionPubKey },
        remainingNullifiers[0][1],
        witness
      )
    ).proof;

    countedSoFar++;
    merkleMap.set(
      Field.from(remainingNullifiers[0][0]),
      remainingNullifiers[0][1].publicOutput.vote
    );
    cachedNullifiers.push(remainingNullifiers[0][0]);
    db.put(
      'aggregated_vote_data',
      JSON.stringify({
        nullifiers: cachedNullifiers.map((n) => n.toString()),
        proof: aggregatorProof.toJSON(),
      })
    );

    remainingNullifiers.shift();
  }

  console.log('Aggregating votes');

  for (let i = 0; i < remainingNullifiers.length; i++) {
    const leaf = remainingNullifiers[i];
    const nullifier = leaf[0];
    const voteProof = leaf[1];

    console.log(
      'Aggregating vote:',
      voteProof.publicOutput.nullifier.toString()
    );

    const merkleWitness = merkleMap.getWitness(Field.from(nullifier));

    console.time('Vote aggregated');

    aggregatorProof = (
      await Aggregation.Program.append_vote(
        {
          votersRoot,
          electionPubKey,
        },
        aggregatorProof,
        voteProof,
        merkleWitness
      )
    ).proof;

    countedSoFar++;
    merkleMap.set(Field.from(nullifier), voteProof.publicOutput.vote);
    cachedNullifiers.push(nullifier);
    db.put(
      'aggregated_vote_data',
      JSON.stringify({
        nullifiers: cachedNullifiers.map((n) => n.toString()),
        proof: aggregatorProof.toJSON(),
      })
    );

    console.timeEnd('Vote aggregated');
  }

  console.log('Aggregation complete');
  console.log(
    'Total aggregated count:',
    aggregatorProof.publicOutput.totalAggregatedCount.toString()
  );
  await fs.writeFile(
    'merkleMapAggregateProof.json',
    JSON.stringify(aggregatorProof, null, 2)
  );
  return aggregatorProof;
};
