import { Field, Struct, ZkProgram } from 'o1js';

export class VoteAggregatorPublicInputs extends Struct({}) {}

export class VoteAggregatorPublicOutputs extends Struct({
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
          yeys: Field.from(0),
          nays: Field.from(0),
        };
      },
    },
  },

  aggregateVotes: {
    privateInputs: [],
    async method() {},
  },
});
