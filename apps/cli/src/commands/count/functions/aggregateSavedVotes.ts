import {
  AggregateProof,
  InnerNode,
  LeafNode,
  RangeAggregationProgram,
  SegmentTree,
  Vote,
  VoteProof,
} from 'zkvot-contracts';
import { Field, JsonProof, PublicKey } from 'o1js';
import { EntryStream } from 'level-read-stream';
import { Level } from 'level';
import async from 'async';

const db = new Level('./cachedProofsDb', { valueEncoding: 'json' });

const buildTheSegmentTreeOfVoteProofs = (
  voteProofs: JsonProof[],
  callback: (
    err: Error | string | null,
    segmentTree?: SegmentTree<bigint, unknown, VoteProof>
  ) => void
) => {
  const segmentTreeLeaves: LeafNode<bigint, VoteProof>[] = [];

  async.each(
    voteProofs,
    (voteProofJson: JsonProof, next: (err: Error | string | null) => void) => {
      VoteProof.fromJSON(voteProofJson)
        .then((voteProof: VoteProof) => {
          const nullifier = voteProof.publicOutput.nullifier.toBigInt();
          const segmentTreeLeaf = new LeafNode(nullifier, voteProof);

          segmentTreeLeaves.push(segmentTreeLeaf);
          next(null);
        })
        .catch((err) => next(err));
    },
    (err) => {
      if (err) return callback(err);

      return callback(null, SegmentTree.build(segmentTreeLeaves));
    }
  );
};

const loadCachedAggregatorProofs = (
  segmentTree: SegmentTree<bigint, unknown, VoteProof>,
  callback: (err: Error | string | null) => void
) => {
  const cachedAggregatorProofs: { includedVotesHash: bigint; proof: string }[] =
    [];

  new EntryStream(db)
    .on('data', (entry) => {
      cachedAggregatorProofs.push({
        includedVotesHash: BigInt(entry.key),
        proof: entry.value,
      });
    })
    .on('error', (err) => callback(err))
    .on('end', () => {
      if (cachedAggregatorProofs.length === 0) return callback(null);

      async.each(
        cachedAggregatorProofs,
        (
          cachedAggregatorProof: { includedVotesHash: bigint; proof: string },
          next: (err: Error | string | null) => void
        ) => {
          const includedVotesHash = cachedAggregatorProof.includedVotesHash;
          const voteProofJson = JSON.parse(cachedAggregatorProof.proof);

          AggregateProof.fromJSON(voteProofJson)
            .then((aggregatedProof: AggregateProof) => {
              segmentTree.cachedAggregatorProofs.set(
                includedVotesHash,
                aggregatedProof
              );

              next(null);
            })
            .catch((err) => next(err));
        },
        (err) => {
          if (err) return callback(err);

          return callback(null);
        }
      );
    });
};

const aggregateNodeProofs = (
  data: {
    node: any;
    votersRoot: Field;
    electionId: PublicKey;
    segmentTree: SegmentTree<bigint, unknown, VoteProof>;
  },
  callback: (
    err: Error | string | null,
    aggregateProof?: AggregateProof
  ) => void
) => {
  const leftChild = data.node.leftChild;
  const rightChild = data.node.rightChild;
  const includedVotesHash = SegmentTree.includedVotesHash(
    data.node.includedVotes
  );

  if (data.segmentTree.cachedAggregatorProofs.has(includedVotesHash))
    return callback('duplicated_aggregate_proof');

  let aggregateProof: AggregateProof | undefined;

  if (leftChild && rightChild) {
    if (leftChild instanceof LeafNode && rightChild instanceof LeafNode) {
      return RangeAggregationProgram.base_two(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChild.voteProof,
        rightChild.voteProof
      )
        .then((proof: AggregateProof) => callback(null, proof))
        .catch((err) => callback(err));
    } else if (
      leftChild instanceof LeafNode &&
      rightChild instanceof InnerNode &&
      leftChild.voteProof instanceof VoteProof
    ) {
      const rightChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
        );

      return RangeAggregationProgram.append_left(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        rightChildAggregatorProof as AggregateProof,
        leftChild.voteProof
      )
        .then((proof: AggregateProof) => callback(null, proof))
        .catch((err) => callback(err));
    } else if (
      leftChild instanceof InnerNode &&
      rightChild instanceof LeafNode &&
      rightChild.voteProof instanceof VoteProof
    ) {
      const leftChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
        );

      return RangeAggregationProgram.append_right(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChildAggregatorProof as AggregateProof,
        rightChild.voteProof
      )
        .then((proof: AggregateProof) => callback(null, proof))
        .catch((err) => callback(err));
    } else if (
      leftChild instanceof InnerNode &&
      rightChild instanceof InnerNode
    ) {
      const leftChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
        );

      const rightChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
        );

      return RangeAggregationProgram.merge(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChildAggregatorProof as AggregateProof,
        rightChildAggregatorProof as AggregateProof
      )
        .then((proof: AggregateProof) => callback(null, proof))
        .catch((err) => callback(err));
    }
  } else if (leftChild) {
    if (leftChild instanceof InnerNode) {
      aggregateProof = data.segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(leftChild.includedVotes) as bigint
      ) as AggregateProof;
    } else if (
      leftChild instanceof LeafNode &&
      leftChild.voteProof instanceof VoteProof
    ) {
      return RangeAggregationProgram.base_one(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChild.voteProof
      )
        .then((proof: AggregateProof) => callback(null, proof))
        .catch((err) => callback(err));
    }
  } else if (rightChild) {
    if (rightChild instanceof InnerNode) {
      aggregateProof = data.segmentTree.getCachedAggregatorProof(
        SegmentTree.includedVotesHash(rightChild.includedVotes) as bigint
      ) as AggregateProof;
    } else if (
      rightChild instanceof LeafNode &&
      rightChild.voteProof instanceof VoteProof
    ) {
      return RangeAggregationProgram.base_one(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        rightChild.voteProof
      )
        .then((proof: AggregateProof) => callback(null, proof))
        .catch((err) => callback(err));
    }
  }

  return callback('aggregate_error');
};

const saveAggregateVoteProofToCache = (
  data: {
    includedVotesHash: bigint;
    aggregateProof: AggregateProof;
    segmentTree: SegmentTree<bigint, unknown, VoteProof>;
  },
  callback: (err: Error | string | null) => void
) => {
  data.segmentTree.cachedAggregatorProofs.set(
    data.includedVotesHash,
    data.aggregateProof
  );

  const includedVotesHashString = data.includedVotesHash.toString();
  const aggregateProofJson = data.aggregateProof.toJSON();
  const aggregateProofString = JSON.stringify(aggregateProofJson);

  db.put(includedVotesHashString, aggregateProofString, (err) => {
    if (err) return callback(err);

    return callback(null);
  });
};

const processSegmentTreeForAggregation = (
  data: {
    segmentTree: SegmentTree<bigint, unknown, VoteProof>;
    votersRoot: Field;
    electionId: PublicKey;
  },
  callback: (err: Error | string | null) => void
) => {
  const aggregateOrder: InnerNode<bigint, VoteProof>[] =
    data.segmentTree.traverse();

  async.eachSeries(
    aggregateOrder,
    (
      node: InnerNode<bigint, VoteProof>,
      next: (err: Error | string | null) => void
    ) => {
      aggregateNodeProofs(
        {
          node,
          votersRoot: data.votersRoot,
          electionId: data.electionId,
          segmentTree: data.segmentTree,
        },
        (err, aggregateProof) => {
          if (err) return next(err);

          if (!aggregateProof) return next('aggregate_error');

          saveAggregateVoteProofToCache(
            {
              includedVotesHash: SegmentTree.includedVotesHash(
                node.includedVotes
              ),
              aggregateProof,
              segmentTree: data.segmentTree,
            },
            (err) => {
              if (err) return next(err);

              return next(null);
            }
          );
        }
      );
    },
    (err) => {
      if (err) return callback(err);

      return callback(null);
    }
  );
};

const getRootAggregatorProof = (
  segmentTree: SegmentTree<bigint, unknown, VoteProof>,
  callback: (
    err: Error | string | null,
    aggregateProof?: AggregateProof
  ) => void
) => {
  if (segmentTree.root instanceof InnerNode) {
    const rootAggregatorProof = segmentTree.getCachedAggregatorProof(
      SegmentTree.includedVotesHash(segmentTree.root.includedVotes) as bigint
    ) as AggregateProof;

    return callback(null, rootAggregatorProof);
  }

  return callback('root_error');
};

export default async (
  data: {
    electionId: PublicKey;
    voteProofs: JsonProof[];
    votersRoot: Field;
  },
  callback: (err: Error | string | null, aggregateProof?: JsonProof) => void
) => {
  await Vote.compile();
  await RangeAggregationProgram.compile();

  buildTheSegmentTreeOfVoteProofs(data.voteProofs, (err, segmentTree) => {
    if (err) return callback(err);

    if (!segmentTree) return callback('segment_tree_error');

    loadCachedAggregatorProofs(segmentTree, (err) => {
      if (err) return callback(err);

      processSegmentTreeForAggregation(
        {
          segmentTree,
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        (err) => {
          if (err) return callback(err);

          getRootAggregatorProof(segmentTree, (err, rootAggregatorProof) => {
            if (err) return callback(err);

            if (!rootAggregatorProof) return callback('root_error');

            db.put(
              `${data.electionId.toBase58()}.aggregatorProof`,
              JSON.stringify(rootAggregatorProof.toJSON()),
              (err) => {
                if (err) return callback(err);

                return callback(null, rootAggregatorProof.toJSON());
              }
            );
          });
        }
      );
    });
  });
};
