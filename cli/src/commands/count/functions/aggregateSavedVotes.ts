import { AggregateProof, RangeAggregationProgram, VoteProof } from "contracts";
import { InnerNode, LeafNode, SegmentTree } from "contracts/src/SegmentTree";
import { Level } from "level";
import { Field, JsonProof, PublicKey } from "o1js";

const db = new Level("./cachedProofsDb", { valueEncoding: "json" });

/**
 * Compile that programs before call this function
 * - Vote
 * - RangeAggregationProgram
 *
 * @param electionId public key of the election
 * @param voteProofs list of vote proofs (make sure to verify them before calling this function)
 * @param votersRoot root of the voters merkle tree
 * @param callback
 *
 * @returns aggregate proof of the election as JSON
 */
export default async (
    electionId: PublicKey,
    voteProofs: JsonProof[],
    votersRoot: Field,
    callback: any
) => {
    const leaves: LeafNode<bigint, VoteProof>[] = [];

    for (let i = 0; i < voteProofs.length; i++) {
        const voteProof = await VoteProof.fromJSON(voteProofs[i]);
        const nullifier = voteProof.publicOutput.nullifier.toBigInt();

        const leaf = new LeafNode(nullifier, voteProof);
        leaves.push(leaf);
    }

    const segmentTree = SegmentTree.build(leaves);

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

        let aggregateProof;

        if (segmentTree.cachedAggregatorProofs.has(includedVotesHash)) {
            console.log("Cache hit for node", i);
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
            } else if (leftChild instanceof InnerNode && rightChild instanceof InnerNode) {
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
            } else if (leftChild instanceof LeafNode && leftChild.voteProof instanceof VoteProof) {
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

        return callback(rootAggregatorProof.toJSON());
    }

    return callback(null);
};
