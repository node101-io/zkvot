import dotenv from 'dotenv';
import { Level } from 'level';
import { Field, PublicKey, verify } from 'o1js';
import fs from 'fs/promises';

import Aggregation from '../aggregation-programs/Aggregation.js';
import AggregationTree from '../aggregation-programs/AggregationTree.js';
import Vote from '../vote/Vote.js';

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
  const leaves: AggregationTree.LeafNode<bigint, Vote.Proof>[] = [];

  let expectedResults = new Array(28).fill(0);

  for (let i = 0; i < voteProofs.length; i++) {
    const voteProof = await Vote.Proof.fromJSON(voteProofs[i]);

    const nullifier = voteProof.publicOutput.nullifier.toBigInt();

    const leaf = new AggregationTree.LeafNode(nullifier, voteProof);

    const ok = await verify(leaf.voteProof, verificationKey);

    if (ok) {
      leaves.push(leaf);
      expectedResults[Number(voteProof.publicOutput.vote.toString())]++;
      console.log(
        'Vote proof',
        leaf.voteProof.publicOutput.nullifier.toString(),
        ' is valid, vote for:',
        leaf.voteProof.publicOutput.vote.toString()
      );
    } else {
      console.log('Vote proof is invalid skipping');
      continue;
    }
  }

  const segmentTree = AggregationTree.Tree.build(leaves);
  console.log('Votes tree built');

  console.log('Connecting to database');

  try {
    console.log('Loading cached aggregator proofs');

    const mappings = [];

    for await (const [key, value] of db.iterator()) {
      mappings.push({ includedVotesHash: key, proof: value });
    }

    if (mappings.length === 0) {
      console.log('No cached aggregator proofs found');
    } else {
      console.log('Cached aggregator proofs found:', mappings.length);
    }

    for (let i = 0; i < mappings.length; i++) {
      const mapping = mappings[i];
      const includedVotesHash = BigInt(mapping.includedVotesHash);
      const proofJson = JSON.parse(mapping.proof);
      const proof = await Aggregation.Proof.fromJSON(proofJson);
      segmentTree.cachedAggregatorProofs.set(includedVotesHash, proof);
    }
  } catch (e) {
    console.log('Error loading cached aggregator proofs', e);
  }

  const aggregateOrder = segmentTree.traverse();

  for (let i = 0; i < aggregateOrder.length; i++) {
    console.time(`Aggregating node ${i} of ${aggregateOrder.length}`);
    const node = aggregateOrder[i];
    const leftChild = node.leftChild;
    const rightChild = node.rightChild;
    const includedVotesHash = AggregationTree.Tree.includedVotesHash(
      node.includedVotes
    );

    let aggregateProof: Aggregation.Proof | undefined;

    if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
      console.log('Cache hit!');
      console.log(node.includedVotes);
      const cachedProof = segmentTree.getCachedAggregatorProof(
        includedVotesHash
      ) as Aggregation.Proof;
      console.log(cachedProof.publicOutput.totalAggregatedCount.toString());
      console.log(
        cachedProof.publicOutput.voteOptions.options.map((f, i) => [
          i,
          f.toBigInt(),
        ])
      );

      continue;
    }
    if (leftChild && rightChild) {
      if (
        leftChild instanceof AggregationTree.LeafNode &&
        rightChild instanceof AggregationTree.LeafNode
      ) {
        aggregateProof = (
          await Aggregation.Program.base_two(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChild.voteProof,
            rightChild.voteProof
          )
        ).proof;
      } else if (
        leftChild instanceof AggregationTree.LeafNode &&
        rightChild instanceof AggregationTree.InnerNode &&
        leftChild.voteProof instanceof Vote.Proof
      ) {
        const rightChildAggregatorProof = segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            rightChild.includedVotes
          ) as bigint
        );

        aggregateProof = (
          await Aggregation.Program.append_left(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            rightChildAggregatorProof as Aggregation.Proof,
            leftChild.voteProof
          )
        ).proof;
      } else if (
        leftChild instanceof AggregationTree.InnerNode &&
        rightChild instanceof AggregationTree.LeafNode &&
        rightChild.voteProof instanceof Vote.Proof
      ) {
        const leftChildAggregatorProof = segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            leftChild.includedVotes
          ) as bigint
        );

        aggregateProof = (
          await Aggregation.Program.append_right(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChildAggregatorProof as Aggregation.Proof,
            rightChild.voteProof
          )
        ).proof;
      } else if (
        leftChild instanceof AggregationTree.InnerNode &&
        rightChild instanceof AggregationTree.InnerNode
      ) {
        const leftChildAggregatorProof = segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            leftChild.includedVotes
          ) as bigint
        );
        const rightChildAggregatorProof = segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            rightChild.includedVotes
          ) as bigint
        );

        aggregateProof = (
          await Aggregation.Program.merge(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChildAggregatorProof as Aggregation.Proof,
            rightChildAggregatorProof as Aggregation.Proof
          )
        ).proof;
      }
    } else if (leftChild) {
      if (leftChild instanceof AggregationTree.InnerNode) {
        aggregateProof = segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            leftChild.includedVotes
          ) as bigint
        ) as Aggregation.Proof;
      } else if (
        leftChild instanceof AggregationTree.LeafNode &&
        leftChild.voteProof instanceof Vote.Proof
      ) {
        aggregateProof = (
          await Aggregation.Program.base_one(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChild.voteProof
          )
        ).proof;
      }
    } else if (rightChild) {
      if (rightChild instanceof AggregationTree.InnerNode) {
        aggregateProof = segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            rightChild.includedVotes
          ) as bigint
        ) as Aggregation.Proof;
      } else if (
        rightChild instanceof AggregationTree.LeafNode &&
        rightChild.voteProof instanceof Vote.Proof
      ) {
        aggregateProof = (
          await Aggregation.Program.base_one(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            rightChild.voteProof
          )
        ).proof;
      }
    }

    segmentTree.cachedAggregatorProofs.set(
      AggregationTree.Tree.includedVotesHash(node.includedVotes),
      aggregateProof
    );

    const includedVotesHashString = includedVotesHash.toString();
    const proofJson = (aggregateProof as Aggregation.Proof).toJSON();
    const proofString = JSON.stringify(proofJson);

    try {
      await db.put(includedVotesHashString, proofString);
      console.log('Cached proof saved to LevelDB');
    } catch (e) {
      console.log('Error saving cached proof to LevelDB', e);
    }
    console.timeEnd(`Aggregating node ${i} of ${aggregateOrder.length}`);
  }

  if (segmentTree.root instanceof AggregationTree.InnerNode) {
    const rootAggregatorProof = segmentTree.getCachedAggregatorProof(
      AggregationTree.Tree.includedVotesHash(
        segmentTree.root.includedVotes
      ) as bigint
    ) as Aggregation.Proof;

    console.log(
      'Total aggregated count:',
      rootAggregatorProof.publicOutput.totalAggregatedCount.toString()
    );
    console.log(
      'Range lower bound:',
      rootAggregatorProof.publicOutput.rangeLowerBound.toString()
    );
    console.log(
      'Range upper bound:',
      rootAggregatorProof.publicOutput.rangeUpperBound.toString()
    );

    await fs.writeFile(
      'aggregateProof.json',
      JSON.stringify(rootAggregatorProof, null, 2)
    );
    return rootAggregatorProof;
  }
  return;
};
