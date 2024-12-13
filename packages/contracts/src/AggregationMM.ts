import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  PublicKey,
  SelfProof,
  Struct,
  ZkProgram,
} from 'o1js';

import Vote from './Vote.js';

namespace AggregationMerkleMapNamespace {
  export class PublicInputs extends Struct({
    votersRoot: Field,
    electionPubKey: PublicKey,
  }) {}

  export class PublicOutputs extends Struct({
    totalAggregatedCount: Field,
    merkleMapRoot: Field,
    voteOptions_1: Field,
    voteOptions_2: Field,
    voteOptions_3: Field,
  }) {}

  export const Program = ZkProgram({
    name: 'AggregationMerkleMapProgram',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,

    methods: {
      base_empty: {
        privateInputs: [],
        async method() {
          const merkleMapRoot = new MerkleMap().getRoot();
          return {
            publicOutput: {
              totalAggregatedCount: Field.from(0),
              merkleMapRoot: merkleMapRoot,
              voteOptions_1: Field.from(0),
              voteOptions_2: Field.from(0),
              voteOptions_3: Field.from(0),
            },
          };
        },
      },
      base_one: {
        privateInputs: [Vote.Proof, MerkleMapWitness],
        async method(
          publicInput: PublicInputs,
          vote: Vote.Proof,
          merkleWitness: MerkleMapWitness
        ) {
          vote.verify();

          vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          vote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );

          const nullifier = vote.publicOutput.nullifier;

          const newVoteOptions = Vote.VoteOptions.empty().addVote(vote);

          const [currentRoot, currentKey] = merkleWitness.computeRootAndKey(
            Field.from(0)
          );
          currentKey.assertEquals(nullifier);
          currentRoot.assertEquals(new MerkleMap().getRoot());

          const [root, key] = merkleWitness.computeRootAndKey(
            vote.publicOutput.vote
          );

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(1),
              merkleMapRoot: root,
              voteOptions_1: newVoteOptions.voteOptions_1,
              voteOptions_2: newVoteOptions.voteOptions_2,
              voteOptions_3: newVoteOptions.voteOptions_3,
            },
          };
        },
      },
      append_vote: {
        privateInputs: [SelfProof, Vote.Proof, MerkleMapWitness],
        async method(
          publicInput: PublicInputs,
          previousProof: SelfProof<PublicInputs, PublicOutputs>,
          vote: Vote.Proof,
          merkleMapWitness: MerkleMapWitness
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

          const [currentRoot, currentKey] = merkleMapWitness.computeRootAndKey(
            Field.from(0)
          );
          currentKey.assertEquals(nullifier);
          currentRoot.assertEquals(previousProof.publicOutput.merkleMapRoot);

          const [newRoot, newKey] = merkleMapWitness.computeRootAndKey(
            vote.publicOutput.vote
          );

          const newVoteOptions = new Vote.VoteOptions({
            voteOptions_1: previousProof.publicOutput.voteOptions_1,
            voteOptions_2: previousProof.publicOutput.voteOptions_2,
            voteOptions_3: previousProof.publicOutput.voteOptions_3,
          }).addVote(vote);

          return {
            publicOutput: {
              totalAggregatedCount:
                previousProof.publicOutput.totalAggregatedCount.add(1),
              merkleMapRoot: newRoot,
              voteOptions_1: newVoteOptions.voteOptions_1,
              voteOptions_2: newVoteOptions.voteOptions_2,
              voteOptions_3: newVoteOptions.voteOptions_3,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}

  // TODO: otomatize et
  export const verificationKey = JSON.stringify({
    "data": "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",
    "hash": "18933434145401524673166218886777138677779932823332518044696662256998703251212"
  });
}

export default AggregationMerkleMapNamespace;
