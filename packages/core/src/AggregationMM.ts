import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  Provable,
  PublicKey,
  SelfProof,
  Struct,
  VerificationKey,
  ZkProgram,
} from 'o1js';

import Vote from './Vote.js';
import { verificationKey as aggregationVK } from './verification-keys/AggregationVK.js';

namespace AggregationMerkleMapNamespace {
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
              voteOptions: Vote.VoteOptions.empty(),
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
              voteOptions: newVoteOptions,
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

          vote.publicOutput.vote.equals(Field.from(0)).assertFalse();
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

          const newVoteOptions =
            previousProof.publicOutput.voteOptions.addVote(vote);

          return {
            publicOutput: {
              totalAggregatedCount:
                previousProof.publicOutput.totalAggregatedCount.add(1),
              merkleMapRoot: newRoot,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}

  export const verificationKey: VerificationKey = JSON.parse(aggregationVK);
}

export default AggregationMerkleMapNamespace;
