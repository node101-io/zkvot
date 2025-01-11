import dotenv from 'dotenv';
import { Level } from 'level';
import { Field, PublicKey, verify } from 'o1js';
import fs from 'fs/promises';

import Aggregation from '../Aggregation.js';
import AggregationTree from '../AggregationTree.js';
import Vote from '../Vote.js';

const db = new Level('./cachedProofsDb', { valueEncoding: 'json' });

dotenv.config();

export const aggregateVotes = async (electionPubKey: PublicKey) => {
  console.time('Compiling vote program');
  let { verificationKey } = await Vote.Program.compile();
  console.timeEnd('Compiling vote program');

  console.time('Compiling range aggregation program');
  await Aggregation.Program.compile();
  console.timeEnd('Compiling range aggregation program');

  const voteProofsJson = await fs.readFile('voteProofs.json');
  const voteProofs = JSON.parse(voteProofsJson.toString());

  const votersRootJson = await fs.readFile('votersRoot.json');
  const votersRoot = Field.from(JSON.parse(votersRootJson.toString()));

  const leaves: AggregationTree.LeafNode<bigint, Vote.Proof>[] = [];

  let verifyPerformances = [];
  for (let i = 0; i < voteProofs.length; i++) {
    let time = performance.now();
    const voteProof = await Vote.Proof.fromJSON(voteProofs[i]);

    const nullifier = voteProof.publicOutput.nullifier.toBigInt();

    const leaf = new AggregationTree.LeafNode(nullifier, voteProof);

    const ok = await verify(leaf.voteProof, verificationKey);

    if (ok) {
      leaves.push(leaf);
    } else {
      console.log('Vote proof is invalid skipping');
      continue;
    }
    let endTime = performance.now();
    verifyPerformances.push(endTime - time);
  }

  const segmentTree = AggregationTree.Tree.build(leaves);

  const aggregateOrder = segmentTree.traverse();

  let aggregatePerformances = [];
  for (let i = 0; i < aggregateOrder.length; i++) {
    console.time(`Aggregating node ${i} of ${aggregateOrder.length}`);
    let time = performance.now();
    const node = aggregateOrder[i];
    const leftChild = node.leftChild;
    const rightChild = node.rightChild;
    const includedVotesHash = AggregationTree.Tree.includedVotesHash(
      node.includedVotes
    );

    let aggregateProof: Aggregation.Proof | undefined;

    if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
      throw new Error('Cached proof found');
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

    let endTime = performance.now();

    console.log(`Time spent aggregating proof: ${endTime - time} ms`);

    aggregatePerformances.push(endTime - time);

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

    await fs.writeFile(
      'aggregateProof.json',
      JSON.stringify(rootAggregatorProof, null, 2)
    );
    return {
      verifyPerformances,
      aggregatePerformances,
    };
  }
  return {
    verifyPerformances,
    aggregatePerformances,
  };
};
