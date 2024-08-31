import {
  collectLeaves,
  InnerNode,
  LeafNode,
  SegmentTree,
} from './SegmentTreeAggregator.js';
import fs from 'fs';
import { Vote, VoteProof } from './VoteProgram.js';
import { Field, Poseidon, verify } from 'o1js';
import {
  AggregateProof,
  RangeAggregationProgram,
} from './RangeAggregationProgram.js';
function readJsonFile(path: string): any {
  const data = fs.readFileSync(path).toString();
  return JSON.parse(data);
}

const voteProofs = readJsonFile('voteProofs.json');

const votersRoot = readJsonFile('votersRoot.json');

let { verificationKey } = await Vote.compile();

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

let { verificationKey: voteAggregatorVerificationKey } =
  await RangeAggregationProgram.compile();

for (let i = 0; i < aggregateOrder.length; i++) {
  const node = aggregateOrder[i];
  const leftChild = node.leftChild;
  const rightChild = node.rightChild;

  let aggregateProof;

  if (leftChild && rightChild) {
    if (leftChild instanceof LeafNode && rightChild instanceof LeafNode) {
      aggregateProof = await RangeAggregationProgram.base_two(
        {
          votersRoot: votersRoot,
          voteId: Field.from(123),
        },
        leftChild.voteProof,
        rightChild.voteProof
      );
    } else if (
      leftChild instanceof LeafNode &&
      rightChild instanceof InnerNode &&
      rightChild.aggregatorProof instanceof AggregateProof &&
      leftChild.voteProof instanceof VoteProof
    ) {
      aggregateProof = await RangeAggregationProgram.append_left(
        {
          votersRoot: votersRoot,
          voteId: Field.from(123),
        },
        rightChild.aggregatorProof,
        leftChild.voteProof
      );

      node.aggregatorProof = aggregateProof;
      segmentTree.cachedAggregatorProofs.set(
        SegmentTree.includedVotesHash(node.includedVotes) as bigint,
        aggregateProof
      );
    }
  }
}
