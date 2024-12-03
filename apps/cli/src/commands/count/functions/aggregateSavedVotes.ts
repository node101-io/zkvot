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
    segmentTree?: AggregationTree.Tree<bigint, unknown, Vote.Proof>
  ) => void
) => {
  const segmentTreeLeaves: AggregationTree.LeafNode<bigint, Vote.Proof>[] = [];

  async.each(
    voteProofs,
    (voteProofJson: JsonProof, next: (err: Error | string | null) => void) => {
      Vote.Proof.fromJSON(voteProofJson)
        .then((voteProof: Vote.Proof) => {
          const nullifier = voteProof.publicOutput.nullifier.toBigInt();
          const segmentTreeLeaf = new AggregationTree.LeafNode(
            nullifier,
            voteProof
          );

          segmentTreeLeaves.push(segmentTreeLeaf);
          next(null);
        })
        .catch((err) => next(err));
    },
    (err) => {
      if (err) return callback(err);

      return callback(null, AggregationTree.Tree.build(segmentTreeLeaves));
    }
  );
};

const loadCachedAggregatorProofs = (
  segmentTree: AggregationTree.Tree<bigint, unknown, Vote.Proof>,
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

          Aggregation.Proof.fromJSON(voteProofJson)
            .then((aggregatedProof: Aggregation.Proof) => {
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
    segmentTree: AggregationTree.Tree<bigint, unknown, Vote.Proof>;
  },
  callback: (
    err: Error | string | null,
    aggregateProof?: Aggregation.Proof
  ) => void
) => {
  const leftChild = data.node.leftChild;
  const rightChild = data.node.rightChild;
  const includedVotesHash = AggregationTree.Tree.includedVotesHash(
    data.node.includedVotes
  );

  if (data.segmentTree.cachedAggregatorProofs.has(includedVotesHash))
    return callback('duplicated_aggregate_proof');

  let aggregateProof: Aggregation.Proof | undefined;

  if (leftChild && rightChild) {
    if (
      leftChild instanceof AggregationTree.LeafNode &&
      rightChild instanceof AggregationTree.LeafNode
    ) {
      return Aggregation.Program.base_two(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChild.voteProof,
        rightChild.voteProof
      )
        .then((proof: { proof: AggregateProof; auxiliaryOutput: undefined }) =>
          callback(null, proof.proof)
        )
        .catch((err) => callback(err));
    } else if (
      leftChild instanceof AggregationTree.LeafNode &&
      rightChild instanceof AggregationTree.InnerNode &&
      leftChild.voteProof instanceof Vote.Proof
    ) {
      const rightChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            rightChild.includedVotes
          ) as bigint
        );

      return Aggregation.Program.append_left(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        rightChildAggregatorProof as Aggregation.Proof,
        leftChild.voteProof
      )
        .then((proof: { proof: AggregateProof; auxiliaryOutput: undefined }) =>
          callback(null, proof.proof)
        )
        .catch((err) => callback(err));
    } else if (
      leftChild instanceof AggregationTree.InnerNode &&
      rightChild instanceof AggregationTree.LeafNode &&
      rightChild.voteProof instanceof Vote.Proof
    ) {
      const leftChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            leftChild.includedVotes
          ) as bigint
        );

      return Aggregation.Program.append_right(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChildAggregatorProof as Aggregation.Proof,
        rightChild.voteProof
      )
        .then((proof: { proof: AggregateProof; auxiliaryOutput: undefined }) =>
          callback(null, proof.proof)
        )
        .catch((err) => callback(err));
    } else if (
      leftChild instanceof AggregationTree.InnerNode &&
      rightChild instanceof AggregationTree.InnerNode
    ) {
      const leftChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            leftChild.includedVotes
          ) as bigint
        );

      const rightChildAggregatorProof =
        data.segmentTree.getCachedAggregatorProof(
          AggregationTree.Tree.includedVotesHash(
            rightChild.includedVotes
          ) as bigint
        );

      return Aggregation.Program.merge(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChildAggregatorProof as Aggregation.Proof,
        rightChildAggregatorProof as Aggregation.Proof
      )
        .then((proof: { proof: AggregateProof; auxiliaryOutput: undefined }) =>
          callback(null, proof.proof)
        )
        .catch((err) => callback(err));
    }
  } else if (leftChild) {
    if (leftChild instanceof AggregationTree.InnerNode) {
      aggregateProof = data.segmentTree.getCachedAggregatorProof(
        AggregationTree.Tree.includedVotesHash(
          leftChild.includedVotes
        ) as bigint
      ) as Aggregation.Proof;
    } else if (
      leftChild instanceof AggregationTree.LeafNode &&
      leftChild.voteProof instanceof Vote.Proof
    ) {
      return Aggregation.Program.base_one(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        leftChild.voteProof
      )
        .then((proof: { proof: AggregateProof; auxiliaryOutput: undefined }) =>
          callback(null, proof.proof)
        )
        .catch((err) => callback(err));
    }
  } else if (rightChild) {
    if (rightChild instanceof AggregationTree.InnerNode) {
      aggregateProof = data.segmentTree.getCachedAggregatorProof(
        AggregationTree.Tree.includedVotesHash(
          rightChild.includedVotes
        ) as bigint
      ) as Aggregation.Proof;
    } else if (
      rightChild instanceof AggregationTree.LeafNode &&
      rightChild.voteProof instanceof Vote.Proof
    ) {
      return Aggregation.Program.base_one(
        {
          votersRoot: data.votersRoot,
          electionId: data.electionId,
        },
        rightChild.voteProof
      )
        .then((proof: { proof: AggregateProof; auxiliaryOutput: undefined }) =>
          callback(null, proof.proof)
        )
        .catch((err) => callback(err));
    }
  }

  return callback('aggregate_error');
};

const saveAggregateVoteProofToCache = (
  data: {
    includedVotesHash: bigint;
    aggregateProof: Aggregation.Proof;
    segmentTree: AggregationTree.Tree<bigint, unknown, Vote.Proof>;
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
    segmentTree: AggregationTree.Tree<bigint, unknown, Vote.Proof>;
    votersRoot: Field;
    electionId: PublicKey;
  },
  callback: (err: Error | string | null) => void
) => {
  const aggregateOrder: AggregationTree.InnerNode<bigint, Vote.Proof>[] =
    data.segmentTree.traverse();

  async.eachSeries(
    aggregateOrder,
    (
      node: AggregationTree.InnerNode<bigint, Vote.Proof>,
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
              includedVotesHash: AggregationTree.Tree.includedVotesHash(
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
  segmentTree: AggregationTree.Tree<bigint, unknown, Vote.Proof>,
  callback: (
    err: Error | string | null,
    aggregateProof?: Aggregation.Proof
  ) => void
) => {
  if (segmentTree.root instanceof AggregationTree.InnerNode) {
    const rootAggregatorProof = segmentTree.getCachedAggregatorProof(
      AggregationTree.Tree.includedVotesHash(
        segmentTree.root.includedVotes
      ) as bigint
    ) as Aggregation.Proof;

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
  await Vote.Program.compile();
  await Aggregation.Program.compile();

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
