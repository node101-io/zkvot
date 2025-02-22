import { Field, PublicKey, SelfProof, Struct, ZkProgram } from 'o1js';

import Vote from '../vote/Vote.js';
import { IndexedMerkleMap } from 'o1js/dist/node/lib/provable/merkle-tree-indexed.js';

namespace AggregationMerkleMapNamespace {
  class MerkleMap extends IndexedMerkleMap(20) {}

  export class PublicInputs extends Struct({
    votersRoot: Field,
    electionPubKey: PublicKey,
  }) {}

  export class PublicOutputs extends Struct({
    totalAggregatedCount: Field,
    merkleMapRoot: Field,
    voteOptions: Vote.VoteOptions,
  }) {}

  export const Program = ZkProgram({
    name: 'AggregationIndexedMerkleMapProgram',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,

    methods: {
      base_empty: {
        privateInputs: [],
        async method() {
          const merkleMapRoot = new MerkleMap().root;
          return {
            publicOutput: {
              totalAggregatedCount: Field.from(0),
              merkleMapRoot: merkleMapRoot,
              voteOptions: Vote.VoteOptions.empty(),
            },
          };
        },
      },
      base_one: {
        privateInputs: [Vote.Proof],
        async method(publicInput: PublicInputs, vote: Vote.Proof) {
          vote.verify();

          vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          vote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );

          const nullifier = vote.publicOutput.nullifier;

          const newVoteOptions = Vote.VoteOptions.empty().addVote(vote);

          const merkleMap = new MerkleMap();
          merkleMap.insert(nullifier, vote.publicOutput.vote);

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(1),
              merkleMapRoot: merkleMap.root,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
      base_two: {
        privateInputs: [Vote.Proof, Vote.Proof],
        async method(
          publicInput: PublicInputs,
          lowerVote: Vote.Proof,
          upperVote: Vote.Proof
        ) {
          lowerVote.verify();
          upperVote.verify();

          lowerVote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          upperVote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          lowerVote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          upperVote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );

          const lowerNullifier = lowerVote.publicOutput.nullifier;
          const upperNullifier = upperVote.publicOutput.nullifier;

          lowerNullifier.assertLessThan(upperNullifier);

          const merkleMap = new MerkleMap();
          merkleMap.insert(lowerNullifier, lowerVote.publicOutput.vote);
          merkleMap.insert(upperNullifier, upperVote.publicOutput.vote);

          const newVoteOptions = Vote.VoteOptions.empty()
            .addVote(lowerVote)
            .addVote(upperVote);

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(2),
              merkleMapRoot: merkleMap.root,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
      append_vote: {
        privateInputs: [SelfProof, Vote.Proof, MerkleMap],
        async method(
          publicInput: PublicInputs,
          previousProof: SelfProof<PublicInputs, PublicOutputs>,
          vote: Vote.Proof,
          merkleMap: MerkleMap
        ) {
          previousProof.verify();
          previousProof.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          previousProof.publicInput.votersRoot.assertEquals(
            publicInput.votersRoot
          );

          vote.verify();

          vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          vote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          const nullifier = vote.publicOutput.nullifier;

          merkleMap.insert(nullifier, vote.publicOutput.vote);

          const newVoteOptions =
            previousProof.publicOutput.voteOptions.addVote(vote);

          return {
            publicOutput: {
              totalAggregatedCount:
                previousProof.publicOutput.totalAggregatedCount.add(1),
              merkleMapRoot: merkleMap.root,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default AggregationMerkleMapNamespace;
