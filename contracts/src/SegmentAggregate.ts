import {
  collectLeaves,
  InnerNode,
  LeafNode,
  SegmentTree,
} from './SegmentTree.js';
import fs from 'fs';
import { Vote, VoteProof } from './VoteProgram.js';
import { Field, PrivateKey, verify } from 'o1js';
import {
  AggregateProof,
  RangeAggregationProgram,
} from './RangeAggregationProgram.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Compiling vote program');

let { verificationKey } = await Vote.compile();

console.log('Compiling range aggregation program');

let { verificationKey: voteAggregatorVerificationKey } =
  await RangeAggregationProgram.compile();

console.log('Aggregating votes');

function readJsonFile(path: string): any {
  const data = fs.readFileSync(path).toString();
  return JSON.parse(data);
}

const voteProofs = readJsonFile('voteProofs.json');

const votersRootJson = readJsonFile('votersRoot.json');
const votersRoot = Field.fromJSON(votersRootJson);

const electionPrivateKey = PrivateKey.fromBase58(
  // @ts-ignore
  process.env.ELECTION_PRIVATE_KEY
);

const electionId = electionPrivateKey.toPublicKey();

const leaves: LeafNode<bigint, VoteProof>[] = [];

for (let i = 0; i < voteProofs.length; i++) {
  const voteProof = await VoteProof.fromJSON(voteProofs[i]);

  const nullifier = voteProof.publicOutput.nullifier.toBigInt();

  leaves.push(new LeafNode(nullifier, voteProof));
}

const segmentTree = SegmentTree.build(leaves);

const allLeaves = collectLeaves(segmentTree.root);

allLeaves.forEach(async (leaf) => {
  console.log(`Leaf nullifier: ${leaf.nullifier.toString()}`);
  console.log(`Vote: ${leaf.voteProof.publicOutput.vote.toString()}`);

  const ok = await verify(leaf.voteProof, verificationKey);
  if (!ok) {
    throw new Error('Vote proof is invalid');
  }
});

const aggregateOrder = segmentTree.traverse();

for (let i = 0; i < aggregateOrder.length; i++) {
  console.log(`Aggregating node ${i} of ${aggregateOrder.length}`);
  const time = Date.now();
  const node = aggregateOrder[i];
  const leftChild = node.leftChild;
  const rightChild = node.rightChild;
  const includedVotesHash = SegmentTree.includedVotesHash(
    node.includedVotes
  ) as bigint;

  let aggregateProof;

  if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
    aggregateProof = segmentTree.cachedAggregatorProofs.get(includedVotesHash);
  }

  if (leftChild && rightChild) {
    if (leftChild instanceof LeafNode && rightChild instanceof LeafNode) {
      aggregateProof = await RangeAggregationProgram.base_two(
        {
          votersRoot: votersRoot,
          electionId: electionId,
        },
        leftChild.voteProof,
        rightChild.voteProof
      );
    } else if (
      leftChild instanceof LeafNode &&
      rightChild instanceof InnerNode &&
      leftChild.voteProof instanceof VoteProof
    ) {
      const rightChildAggregatorProof = segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
      );

      aggregateProof = await RangeAggregationProgram.append_left(
        {
          votersRoot: votersRoot,
          electionId: electionId,
        },
        rightChildAggregatorProof as AggregateProof,
        leftChild.voteProof
      );
    } else if (
      leftChild instanceof InnerNode &&
      rightChild instanceof LeafNode &&
      rightChild.voteProof instanceof VoteProof
    ) {
      const leftChildAggregatorProof = segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
      );

      aggregateProof = await RangeAggregationProgram.append_right(
        {
          votersRoot: votersRoot,
          electionId: electionId,
        },
        leftChildAggregatorProof as AggregateProof,
        rightChild.voteProof
      );
    } else if (
      leftChild instanceof InnerNode &&
      rightChild instanceof InnerNode
    ) {
      const leftChildAggregatorProof = segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
      );
      const rightChildAggregatorProof = segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
      );

      aggregateProof = await RangeAggregationProgram.merge(
        {
          votersRoot: votersRoot,
          electionId: electionId,
        },
        leftChildAggregatorProof as AggregateProof,
        rightChildAggregatorProof as AggregateProof
      );
    }
  } else if (leftChild) {
    if (leftChild instanceof InnerNode) {
      aggregateProof = segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
      );
    } else if (
      leftChild instanceof LeafNode &&
      leftChild.voteProof instanceof VoteProof
    ) {
      aggregateProof = await RangeAggregationProgram.base_one(
        {
          votersRoot: votersRoot,
          electionId: electionId,
        },
        leftChild.voteProof
      );
    }
  } else if (rightChild) {
    if (rightChild instanceof InnerNode) {
      aggregateProof = segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
      );
    } else if (
      rightChild instanceof LeafNode &&
      rightChild.voteProof instanceof VoteProof
    ) {
      aggregateProof = await RangeAggregationProgram.base_one(
        {
          votersRoot: votersRoot,
          electionId: electionId,
        },
        rightChild.voteProof
      );
    }
  }

  segmentTree.cachedAggregatorProofs.set(
    SegmentTree.includedVotesHash(node.includedVotes) as bigint,
    aggregateProof
  );

  console.log('Aggregation time:', (Date.now() - time) / 1000, 'seconds');
}

console.log('Aggregation complete');

if (segmentTree.root instanceof InnerNode) {
  const rootAggregatorProof = segmentTree.getCachedAggregatorProof(
    SegmentTree.includedVotesHash(segmentTree.root.includedVotes) as bigint
  ) as AggregateProof;

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
  console.log(
    'voteOptions_1:',
    rootAggregatorProof.publicOutput.voteOptions_1.toString()
  );
  console.log(
    'voteOptions_2:',
    rootAggregatorProof.publicOutput.voteOptions_2.toString()
  );
}
