import {
  collectLeaves,
  InnerNode,
  LeafNode,
  SegmentTree,
} from './SegmentTreeAggregator.js';
import fs from 'fs';
import { Vote, VoteProof } from './VoteProgram.js';
import { Field, verify } from 'o1js';
import {
  AggregateProof,
  RangeAggregationProgram,
} from './RangeAggregationProgram.js';

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

const voteId = Field.from(123);

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
          voteId: voteId,
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
          voteId: voteId,
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
          voteId: voteId,
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
          voteId: voteId,
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
          voteId: voteId,
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
          voteId: voteId,
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
  console.log('Yeys:', rootAggregatorProof.publicOutput.yeys.toString());
  console.log('Nays:', rootAggregatorProof.publicOutput.nays.toString());
}
