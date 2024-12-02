import { Field, PublicKey, verify } from "o1js";
import {
  AggregateProof,
  fieldToUInt32BigEndian,
  RangeAggregationProgram,
} from "../RangeAggregationProgram.js";
import { Vote, VoteProof } from "../VoteProgram.js";
import fs from "fs/promises";
import { InnerNode, LeafNode, SegmentTree } from "../SegmentTree.js";
import dotenv from "dotenv";
import { Level } from "level";

const db = new Level("./cachedProofsDb", { valueEncoding: "json" });

dotenv.config();

const addRandom = false;

export const runAggregate = async (electionPubKey: PublicKey) => {
  console.time("Compiling vote program");
  let { verificationKey } = await Vote.compile();
  console.timeEnd("Compiling vote program");

  console.time("Compiling range aggregation program");
  await RangeAggregationProgram.compile();
  console.timeEnd("Compiling range aggregation program");

  console.log("Reading vote proofs");

  const voteProofsJson = await fs.readFile("voteProofs.json");
  const voteProofs = JSON.parse(voteProofsJson.toString());
  console.log("Vote proofs read, there are", voteProofs.length, "proofs found");

  console.log("Reading voters root");
  const votersRootJson = await fs.readFile("votersRoot.json");
  const votersRoot = Field.from(JSON.parse(votersRootJson.toString()));
  console.log("Voters root read, voters root:", votersRoot.toString());

  console.log("Checking votes");
  const leaves: LeafNode<bigint, VoteProof>[] = [];

  let expectedResults = new Array(28).fill(0);

  for (let i = 0; i < voteProofs.length; i++) {
    const voteProof = await VoteProof.fromJSON(voteProofs[i]);

    const nullifier = voteProof.publicOutput.nullifier.toBigInt();

    const leaf = new LeafNode(nullifier, voteProof);

    const ok = await verify(leaf.voteProof, verificationKey);

    if (ok) {
      leaves.push(leaf);
      expectedResults[Number(voteProof.publicOutput.vote.toString())]++;
      console.log(
        "Vote proof",
        leaf.voteProof.publicOutput.nullifier.toString(),
        " is valid, vote for:",
        leaf.voteProof.publicOutput.vote.toString()
      );
    } else {
      console.log("Vote proof is invalid skipping");
      continue;
    }
  }

  console.log(
    "Expected results:",
    expectedResults.map((x, i) => [i, x])
  );

  const segmentTree = SegmentTree.build(leaves);
  console.log("Votes tree built");

  console.log("Connecting to database");

  try {
    console.log("Loading cached aggregator proofs");

    const mappings = [];

    for await (const [key, value] of db.iterator()) {
      mappings.push({ includedVotesHash: key, proof: value });
    }

    if (mappings.length === 0) {
      console.log("No cached aggregator proofs found");
    } else {
      console.log("Cached aggregator proofs found:", mappings.length);
    }

    for (let i = 0; i < mappings.length; i++) {
      const mapping = mappings[i];
      const includedVotesHash = BigInt(mapping.includedVotesHash);
      const proofJson = JSON.parse(mapping.proof);
      const proof = await AggregateProof.fromJSON(proofJson);
      segmentTree.cachedAggregatorProofs.set(includedVotesHash, proof);
    }
  } catch (e) {
    console.log("Error loading cached aggregator proofs", e);
  }

  const aggregateOrder = segmentTree.traverse();

  for (let i = 0; i < aggregateOrder.length; i++) {
    console.time(`Aggregating node ${i} of ${aggregateOrder.length}`);
    const node = aggregateOrder[i];
    const leftChild = node.leftChild;
    const rightChild = node.rightChild;
    const includedVotesHash = SegmentTree.includedVotesHash(node.includedVotes);

    let aggregateProof: AggregateProof | undefined;

    if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
      console.log("Cache hit!");
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
        )
      );

      continue;
    }
    if (leftChild && rightChild) {
      if (leftChild instanceof LeafNode && rightChild instanceof LeafNode) {
        aggregateProof = (
          await RangeAggregationProgram.base_two(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChild.voteProof,
            rightChild.voteProof
          )
        ).proof;
      } else if (
        leftChild instanceof LeafNode &&
        rightChild instanceof InnerNode &&
        leftChild.voteProof instanceof VoteProof
      ) {
        const rightChildAggregatorProof = segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
        );

        aggregateProof = (
          await RangeAggregationProgram.append_left(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            rightChildAggregatorProof as AggregateProof,
            leftChild.voteProof
          )
        ).proof;
      } else if (
        leftChild instanceof InnerNode &&
        rightChild instanceof LeafNode &&
        rightChild.voteProof instanceof VoteProof
      ) {
        const leftChildAggregatorProof = segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
        );

        aggregateProof = (
          await RangeAggregationProgram.append_right(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChildAggregatorProof as AggregateProof,
            rightChild.voteProof
          )
        ).proof;
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

        aggregateProof = (
          await RangeAggregationProgram.merge(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChildAggregatorProof as AggregateProof,
            rightChildAggregatorProof as AggregateProof
          )
        ).proof;
      }
    } else if (leftChild) {
      if (leftChild instanceof InnerNode) {
        aggregateProof = segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
        ) as AggregateProof;
      } else if (
        leftChild instanceof LeafNode &&
        leftChild.voteProof instanceof VoteProof
      ) {
        aggregateProof = (
          await RangeAggregationProgram.base_one(
            {
              votersRoot: votersRoot,
              electionPubKey,
            },
            leftChild.voteProof
          )
        ).proof;
      }
    } else if (rightChild) {
      if (rightChild instanceof InnerNode) {
        aggregateProof = segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
        ) as AggregateProof;
      } else if (
        rightChild instanceof LeafNode &&
        rightChild.voteProof instanceof VoteProof
      ) {
        aggregateProof = (
          await RangeAggregationProgram.base_one(
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
      SegmentTree.includedVotesHash(node.includedVotes),
      aggregateProof
    );

    const includedVotesHashString = includedVotesHash.toString();
    if (!aggregateProof) {
      throw new Error("Aggregate proof is undefined");
    }
    const proofJson = aggregateProof.toJSON();
    const proofString = JSON.stringify(proofJson);

    try {
      await db.put(includedVotesHashString, proofString);
      console.log("Cached proof saved to LevelDB");
    } catch (e) {
      console.log("Error saving cached proof to LevelDB", e);
    }
    console.timeEnd(`Aggregating node ${i} of ${aggregateOrder.length}`);
  }

  if (segmentTree.root instanceof InnerNode) {
    const rootAggregatorProof = segmentTree.getCachedAggregatorProof(
      SegmentTree.includedVotesHash(segmentTree.root.includedVotes) as bigint
    ) as AggregateProof;

    console.log(
      "Total aggregated count:",
      rootAggregatorProof.publicOutput.totalAggregatedCount.toString()
    );
    console.log(
      "Range lower bound:",
      rootAggregatorProof.publicOutput.rangeLowerBound.toString()
    );
    console.log(
      "Range upper bound:",
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

    await fs.writeFile(
      "aggregateProof.json",
      JSON.stringify(rootAggregatorProof, null, 2)
    );
  }
  return;
};
