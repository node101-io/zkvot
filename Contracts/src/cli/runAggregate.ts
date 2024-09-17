import { Field, verify } from 'o1js';
import {
  AggregateProof,
  RangeAggregationProgram,
  VoteOptions,
} from '../RangeAggregationProgram.js';
import { Vote, VoteProof } from '../VoteProgram.js';
import fs from 'fs/promises';
import { InnerNode, LeafNode, SegmentTree } from '../SegmentTree.js';
import { CachedProofs } from './schema.js';
import Database from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const addRandom = true;

export const runAggregate = async (voteId: string) => {
  console.log('Compiling vote program');

  let { verificationKey } = await Vote.compile();
  console.log('Vote program compiled');

  console.log('Compiling range aggregation program');
  await RangeAggregationProgram.compile();
  console.log('Range aggregation program compiled');

  console.log('Reading vote proofs');

  const voteProofsJson = await fs.readFile('voteProofs.json');
  const voteProofs = JSON.parse(voteProofsJson.toString());
  console.log('Vote proofs read, there are', voteProofs.length, 'proofs found');

  const voteProofsRandomJson = await fs.readFile('voteProofsRandom.json');
  const voteProofsRandom = JSON.parse(voteProofsRandomJson.toString());
  console.log(
    'Random vote proofs read, there are',
    voteProofsRandom.length,
    'proofs found'
  );

  console.log('Reading voters root');
  const votersRootJson = await fs.readFile('votersRoot.json');
  const votersRoot = Field.from(JSON.parse(votersRootJson.toString()));
  console.log('Voters root read, voters root:', votersRoot.toString());

  console.log('Checking votes');
  const leaves: LeafNode<bigint, VoteProof>[] = [];

  for (let i = 0; i < voteProofs.length; i++) {
    const voteProof = await VoteProof.fromJSON(voteProofs[i]);

    const nullifier = voteProof.publicOutput.nullifier.toBigInt();

    const leaf = new LeafNode(nullifier, voteProof);

    const ok = await verify(leaf.voteProof, verificationKey);

    if (ok) {
      leaves.push(leaf);
      console.log(
        'Vote proof is valid, vote for:',
        leaf.voteProof.publicOutput.vote.toString()
      );
    } else {
      console.log('Vote proof is invalid skipping');
      continue;
    }
  }

  if (addRandom) {
    console.log('Adding random votes');
    for (let i = 0; i < voteProofsRandom.length; i++) {
      const voteProof = await VoteProof.fromJSON(voteProofsRandom[i]);

      const nullifier = voteProof.publicOutput.nullifier.toBigInt();

      const leaf = new LeafNode(nullifier, voteProof);

      const ok = await verify(leaf.voteProof, verificationKey);

      if (ok) {
        leaves.push(leaf);
        console.log(
          'Vote proof is valid, vote for:',
          leaf.voteProof.publicOutput.vote.toString()
        );
      } else {
        console.log('Vote proof is invalid skipping');
        continue;
      }
    }
  }

  const segmentTree = SegmentTree.build(leaves);
  console.log('Votes tree built');

  console.log('Connecting to database');

  await Database.getInstance();

  try {
    console.log('Loading cached aggregator proofs');

    const mappings = await CachedProofs.find({}).exec();

    if (mappings.length === 0) {
      console.log('No cached aggregator proofs found');
    } else {
      console.log('Cached aggregator proofs found: ', mappings.length);
      // segmentTree.cachedAggregatorProofs.clear();
    }

    for (let i = 0; i < mappings.length; i++) {
      const mapping = mappings[i];
      const includedVotesHash = BigInt(mapping.includedVotesHash);
      const proofJson = JSON.parse(mapping.proof);
      const proof = await AggregateProof.fromJSON(proofJson);
      segmentTree.cachedAggregatorProofs.set(includedVotesHash, proof);
    }
  } catch (e) {
    console.log('Error loading cached aggregator proofs', e);
  }

  const aggregateOrder = segmentTree.traverse();

  for (let i = 0; i < aggregateOrder.length; i++) {
    console.log(`Aggregating node ${i} of ${aggregateOrder.length}`);
    const time = Date.now();
    const node = aggregateOrder[i];
    const leftChild = node.leftChild;
    const rightChild = node.rightChild;
    const includedVotesHash = SegmentTree.includedVotesHash(node.includedVotes);

    let aggregateProof;

    if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
      console.log('Cache hit!');
      continue;
    }
    if (leftChild && rightChild) {
      if (leftChild instanceof LeafNode && rightChild instanceof LeafNode) {
        aggregateProof = await RangeAggregationProgram.base_two(
          {
            votersRoot: votersRoot,
            voteId: Field.from(voteId),
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
            voteId: Field.from(voteId),
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
            voteId: Field.from(voteId),
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
            voteId: Field.from(voteId),
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
            voteId: Field.from(voteId),
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
            voteId: Field.from(voteId),
          },
          rightChild.voteProof
        );
      }
    }

    segmentTree.cachedAggregatorProofs.set(
      SegmentTree.includedVotesHash(node.includedVotes),
      aggregateProof
    );

    const includedVotesHashString = includedVotesHash.toString();
    const proofJson = (aggregateProof as AggregateProof).toJSON();
    const proofString = JSON.stringify(proofJson);

    try {
      await CachedProofs.create({
        includedVotesHash: includedVotesHashString,
        proof: proofString,
      });
      console.log('Cached proof saved to Mongo');
    } catch (e) {
      console.log('Error saving cached proof to Mongo', e);
    }
    console.log('Aggregation time:', (Date.now() - time) / 1000, 'seconds');
  }

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
    let arr = VoteOptions.decompress(
      rootAggregatorProof.publicOutput.voteOptions_1
    ).toUInt32();

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 1}:`, arr[i].toString());
    }

    arr = VoteOptions.decompress(
      rootAggregatorProof.publicOutput.voteOptions_2
    ).toUInt32();

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 8}:`, arr[i].toString());
    }
  }
  return;
};

await runAggregate('123');
