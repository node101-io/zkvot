import { Field, PublicKey, PrivateKey, verify } from 'o1js';
import {
  AggregateProof,
  fieldToUInt32BigEndian,
  RangeAggregationProgram,
} from '../RangeAggregationProgram.js';
import { Vote, VoteProof } from '../VoteProgram.js';
import fs from 'fs/promises';
import { InnerNode, LeafNode, SegmentTree } from '../SegmentTree.js';
import dotenv from 'dotenv';
import { Level } from 'level';

const db = new Level('./cachedProofsDb', { valueEncoding: 'json' });

dotenv.config();

const addRandom = false;

export const runAggregate = async (electionId: PublicKey) => {
  console.time('Compiling vote program');
  let { verificationKey } = await Vote.compile();
  console.timeEnd('Compiling vote program');

  console.time('Compiling range aggregation program');
  await RangeAggregationProgram.compile();
  console.timeEnd('Compiling range aggregation program');

  console.log('Reading vote proofs');

  const voteProofsJson = await fs.readFile('voteProofsEcdsa256.json');
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
  const votersRootJson = await fs.readFile('votersRootEcdsa256.json');
  const votersRoot = Field.from(JSON.parse(votersRootJson.toString()));
  console.log('Voters root read, voters root:', votersRoot.toString());

  console.log('Checking votes');
  const leaves: LeafNode<bigint, VoteProof>[] = [];

  let expectedResults = new Array(43).fill(0);

  for (let i = 0; i < voteProofs.length; i++) {
    const voteProof = await VoteProof.fromJSON(voteProofs[i]);

    const nullifier = voteProof.publicOutput.nullifier.toBigInt();

    const leaf = new LeafNode(nullifier, voteProof);

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

  console.log(
    'Expected results:',
    expectedResults.map((x, i) => [i, x])
  );

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
      const proof = await AggregateProof.fromJSON(proofJson);
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
    const includedVotesHash = SegmentTree.includedVotesHash(node.includedVotes);

    let aggregateProof;

    if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
      console.log('Cache hit!');
      console.log(node.includedVotes);
      const cachedProof = segmentTree.getCachedAggregatorProof(
        includedVotesHash
      ) as AggregateProof;
      console.log(cachedProof.publicOutput.totalAggregatedCount.toString());
      console.log(
        fieldToUInt32BigEndian(cachedProof.publicOutput.voteOptions_1).map(
          (f, i) => [i + 1, f.toBigint()]
        ),
        fieldToUInt32BigEndian(cachedProof.publicOutput.voteOptions_2).map(
          (f, i) => [i + 8, f.toBigint()]
        ),
        fieldToUInt32BigEndian(cachedProof.publicOutput.voteOptions_3).map(
          (f, i) => [i + 15, f.toBigint()]
        ),
        fieldToUInt32BigEndian(cachedProof.publicOutput.voteOptions_4).map(
          (f, i) => [i + 22, f.toBigint()]
        ),
        fieldToUInt32BigEndian(cachedProof.publicOutput.voteOptions_5).map(
          (f, i) => [i + 29, f.toBigint()]
        ),
        fieldToUInt32BigEndian(cachedProof.publicOutput.voteOptions_6).map(
          (f, i) => [i + 36, f.toBigint()]
        )
      );

      continue;
    }
    if (leftChild && rightChild) {
      if (leftChild instanceof LeafNode && rightChild instanceof LeafNode) {
        aggregateProof = await RangeAggregationProgram.base_two(
          {
            votersRoot: votersRoot,
            electionId,
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
            electionId,
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
            electionId,
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
            electionId,
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
            electionId,
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
            electionId,
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
      await db.put(includedVotesHashString, proofString);
      console.log('Cached proof saved to LevelDB');
    } catch (e) {
      console.log('Error saving cached proof to LevelDB', e);
    }
    console.timeEnd(`Aggregating node ${i} of ${aggregateOrder.length}`);
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
    let arr = fieldToUInt32BigEndian(
      rootAggregatorProof.publicOutput.voteOptions_1
    );

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 1}:`, arr[i].toString());
    }

    arr = fieldToUInt32BigEndian(
      rootAggregatorProof.publicOutput.voteOptions_2
    );

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 8}:`, arr[i].toString());
    }

    arr = fieldToUInt32BigEndian(
      rootAggregatorProof.publicOutput.voteOptions_3
    );

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 15}:`, arr[i].toString());
    }

    arr = fieldToUInt32BigEndian(
      rootAggregatorProof.publicOutput.voteOptions_4
    );

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 22}:`, arr[i].toString());
    }

    arr = fieldToUInt32BigEndian(
      rootAggregatorProof.publicOutput.voteOptions_5
    );

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 29}:`, arr[i].toString());
    }

    arr = fieldToUInt32BigEndian(
      rootAggregatorProof.publicOutput.voteOptions_6
    );

    for (let i = 0; i < 7; i++) {
      console.log(`voteOptions_${i + 36}:`, arr[i].toString());
    }
  }
  return;
};

const electionPrivateKey = PrivateKey.fromBase58(
  // @ts-ignore
  process.env.ELECTION_PRIVATE_KEY
);
const electionId = electionPrivateKey.toPublicKey();
await runAggregate(electionId);
