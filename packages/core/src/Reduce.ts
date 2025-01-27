import { Field, Struct, ZkProgram } from 'o1js';
import Election from './Election';
import Vote from './Vote';
import { Actions } from 'o1js/dist/node/lib/mina/account-update';

export class ElectionReducePublicInputs extends Struct({}) {}

export class ElectionReducePrivateInputs extends Struct({}) {}

export class ElectionReducePublicOutputs extends Struct({
  actionStateHash: Field,
  maximumCountedState: Election.ElectionState,
}) {}

export const ElectionReduceProgram = ZkProgram({
  name: 'ElectionReduce',
  publicInput: ElectionReducePublicInputs,
  publicOutput: ElectionReducePublicOutputs,

  methods: {
    init: {
      privateInputs: [ElectionReducePrivateInputs],
      async method(
        publicInput: ElectionReducePublicInputs,
        privateInput: ElectionReducePrivateInputs
      ) {
        return {
          publicOutput: {
            actionStateHash: Actions.empty().hash,
            maximumCountedState: new Election.ElectionState({
              lastAggregatorPubKeyHash: Field.empty(),
              voteOptions: new Vote.VoteOptions({
                options: [Field.empty(), Field.empty()],
              }),
              maximumCountedVotes: Field.empty(),
            }),
          },
        };
      },
    },

    reduceAction: {
      privateInputs: [ElectionReducePrivateInputs],
      async method(
        publicInput: ElectionReducePublicInputs,
        privateInput: ElectionReducePrivateInputs
      ) {
        return {
          publicOutput: {
            actionStateHash: Actions.empty().hash,
            maximumCountedState: new Election.ElectionState({
              lastAggregatorPubKeyHash: Field.empty(),
              voteOptions: new Vote.VoteOptions({
                options: [Field.empty(), Field.empty()],
              }),
              maximumCountedVotes: Field.empty(),
            }),
          },
        };
      },
    },
  },
});

export class ElectionReduceProof extends ZkProgram.Proof(
  ElectionReduceProgram
) {}
