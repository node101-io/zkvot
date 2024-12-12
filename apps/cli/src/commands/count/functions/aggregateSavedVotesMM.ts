import { Field, JsonProof, MerkleMap, PublicKey, verify } from 'o1js';
import { Level } from 'level';
import { AggregationMM as Aggregation, Vote } from 'zkvot-core';

const db = new Level('./cachedProofsDb', { valueEncoding: 'json' });

export default async (
  data: {
    electionPubKey: PublicKey;
    voteProofs: JsonProof[];
    votersRoot: Field;
  },
  callback: (err: Error | string | null, aggregateProof?: JsonProof) => void
) => {
  try {
    console.time('Compiling vote program');
    let { verificationKey } = await Vote.Program.compile();
    console.timeEnd('Compiling vote program');

    console.time('Compiling range aggregation program');
    await Aggregation.Program.compile();
    console.timeEnd('Compiling range aggregation program');

    const { electionPubKey, voteProofs, votersRoot } = data;

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

    let aggregatorProof: Aggregation.Proof | null = null;
    let cachedNullifiers: bigint[] = [];
    let countedSoFar = 0;
    let merkleMap = new MerkleMap();
    try {
      const storedDataString = await db.get('aggregated_vote_data');

      if (storedDataString) {
        const storedData = JSON.parse(storedDataString);

        const nullifiersAndVotes: [bigint, number][] =
          storedData.nullifiers.map(
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
      } else {
        console.log('No aggregated vote data found');
      }
    } catch (error) {
      console.error('Error retrieving aggregated vote data:', error);
      callback(error instanceof Error ? error : new Error(String(error)));
      return;
    }

    const remainingNullifiers = leaves.filter(
      (leaf) => !cachedNullifiers.includes(leaf[0])
    );

    if (remainingNullifiers.length === 0) {
      console.log('All votes are already aggregated');
      callback(null, aggregatorProof?.toJSON());
      return;
    }

    if (!aggregatorProof) {
      console.log('No base proof found. Initializing aggregatorProof.');
      try {
        const witness = merkleMap.getWitness(
          Field.from(remainingNullifiers[0][0])
        );
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
        await db.put(
          'aggregated_vote_data',
          JSON.stringify({
            nullifiers: cachedNullifiers.map((n) => n.toString()),
            proof: aggregatorProof.toJSON(),
          })
        );

        remainingNullifiers.shift();
      } catch (error) {
        console.error('Error initializing base proof:', error);
        callback(error instanceof Error ? error : new Error(String(error)));
        return;
      }
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

      try {
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
        await db.put(
          'aggregated_vote_data',
          JSON.stringify({
            nullifiers: cachedNullifiers.map((n) => n.toString()),
            proof: aggregatorProof.toJSON(),
          })
        );

        console.timeEnd('Vote aggregated');
      } catch (error) {
        console.error('Error during vote aggregation:', error);
        callback(error instanceof Error ? error : new Error(String(error)));
        return;
      }
    }

    console.log('Aggregation complete');
    console.log(
      'Total aggregated count:',
      aggregatorProof.publicOutput.totalAggregatedCount.toString()
    );
    try {
      callback(null, aggregatorProof.toJSON());
    } catch (error) {
      console.error('Error writing final proof to file:', error);
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  } catch (error) {
    console.error('Error in runAggregate:', error);
    callback(error instanceof Error ? error : new Error(String(error)));
  }
};
