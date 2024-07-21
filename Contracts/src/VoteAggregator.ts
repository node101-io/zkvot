import { Field, Provable, SelfProof, Struct, ZkProgram } from 'o1js';
import { VoteProgramProof } from './VoteProgram';

export class VoteAggregatorPublicInputs extends Struct({}) {}

export class VoteAggregatorPublicOutputs extends Struct({
  totalAggregatedCount: Field,
  yeys: Field,
  nays: Field,
}) {}

export const VoteAggregator = ZkProgram({
  name: 'VoteAggregator',
  publicInput: VoteAggregatorPublicInputs,
  publicOutput: VoteAggregatorPublicOutputs,

  methods: {
    base: {
      privateInputs: [],
      async method() {
        return {
          totalAggregatedCount: Field.from(0),
          yeys: Field.from(0),
          nays: Field.from(0),
        };
      },
    },
  },

  aggregateVotes: {
    privateInputs: [SelfProof, VoteProgramProof],
    async method(
      previousProof: SelfProof<
        VoteAggregatorPublicInputs,
        VoteAggregatorPublicOutputs
      >,
      vote: VoteProgramProof
    ) {
      previousProof.verify();

      vote.verify();

      const totalAggregatedCount = previousProof.publicOutput.yeys.add(
        previousProof.publicOutput.nays
      );

      previousProof.publicOutput.totalAggregatedCount.assertEquals(
        totalAggregatedCount
      );

      const yeys = Provable.if(
        vote.publicOutput.vote.equals(Field.from(1)),
        previousProof.publicOutput.yeys.add(1),
        previousProof.publicOutput.yeys
      );
      const nays = Provable.if(
        vote.publicOutput.vote.equals(Field.from(0)),
        previousProof.publicOutput.nays.add(1),
        previousProof.publicOutput.nays
      );

      return {
        totalAggregatedCount:
          previousProof.publicOutput.totalAggregatedCount.add(1),
        yeys,
        nays,
      };
    },
  },
});
