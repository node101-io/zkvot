import {
  Account,
  Field,
  method,
  fetchAccount,
  SmartContract,
  Permissions,
  State,
  state,
  PublicKey,
  Bool,
  Struct,
  Poseidon,
  Signature,
  UInt64,
  UInt32,
} from 'o1js';

// import Aggregation from './Aggregation.js';
import Aggregation from './AggregationMM.js';

import Vote from './Vote.js';

let ELECTION_START_SLOT: number;
let ELECTION_FINALIZE_SLOT: number;
let VOTERS_ROOT: bigint;

namespace ElectionNamespace {
  type FetchError = {
    statusCode: number;
    statusText: string;
  };

  const convertFieldArrayToContractState = (fields: Field[]): ContractState => {
    return {
      storageLayerInfoEncoding: {
        first: fields[0],
        last: fields[1],
      },
      storageLayerCommitment: fields[2],
      lastAggregatorPubKeyHash: fields[3],
      voteOptions: new Vote.VoteOptions({
        voteOptions_1: fields[4],
        voteOptions_2: fields[5],
        voteOptions_3: fields[6],
      }),
      maximumCountedVotes: fields[7],
    };
  };

  export const ContractErrors = {};

  export type ContractState = {
    storageLayerInfoEncoding: StorageLayerInfoEncoding;
    storageLayerCommitment: Field;
    lastAggregatorPubKeyHash: Field;
    voteOptions: Vote.VoteOptions;
    maximumCountedVotes: Field;
  };

  export const setContractConstants = (data: {
    electionStartSlot: number;
    electionFinalizeSlot: number;
    votersRoot: bigint;
  }) => {
    ELECTION_START_SLOT = data.electionStartSlot;
    ELECTION_FINALIZE_SLOT = data.electionFinalizeSlot;
    VOTERS_ROOT = data.votersRoot;
  };

  export class StorageLayerInfoEncoding extends Struct({
    first: Field,
    last: Field,
  }) {}

  export class Contract extends SmartContract {
    @state(StorageLayerInfoEncoding) storageLayerInfoEncoding =
      State<StorageLayerInfoEncoding>();

    @state(Field) storageLayerCommitment = State<Field>();

    @state(Field) lastAggregatorPubKeyHash = State<Field>();

    @state(Vote.VoteOptions) voteOptions = State<Vote.VoteOptions>();

    @state(Field) maximumCountedVotes = State<Field>();

    readonly events = {
      Settlement: NewSettlementEvent,
    };

    async deploy() {
      await super.deploy();
      this.account.permissions.set({
        ...Permissions.default(),
        send: Permissions.proof(),
        setPermissions: Permissions.impossible(),
        setVerificationKey:
          Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      });
    }

    @method
    async initialize(
      storageLayerInfoEncoding: StorageLayerInfoEncoding,
      storageLayerCommitment: Field
    ) {
      this.account.provedState.requireEquals(Bool(false));

      this.storageLayerInfoEncoding.set(storageLayerInfoEncoding);
      this.storageLayerCommitment.set(storageLayerCommitment);
      this.voteOptions.set(Vote.VoteOptions.empty());
      this.maximumCountedVotes.set(Field.from(0));
    }

    @method
    async settleVotes(
      aggregateProof: Aggregation.Proof,
      lastAggregatorPubKey: PublicKey
    ) {
      aggregateProof.verify();

      aggregateProof.publicInput.electionPubKey.assertEquals(this.address);
      aggregateProof.publicInput.votersRoot.assertEquals(Field.from(VOTERS_ROOT));

      const currentSlot =
        this.network.globalSlotSinceGenesis.getAndRequireEquals();
      currentSlot.assertGreaterThan(UInt32.from(ELECTION_START_SLOT));
      currentSlot.assertLessThan(UInt32.from(ELECTION_FINALIZE_SLOT));

      let currentMaximumCountedVotes = this.maximumCountedVotes.getAndRequireEquals();

      currentMaximumCountedVotes.assertLessThan(
        aggregateProof.publicOutput.totalAggregatedCount
      );

      this.maximumCountedVotes.set(
        aggregateProof.publicOutput.totalAggregatedCount
      );

      const newVoteOptions = new Vote.VoteOptions({
        voteOptions_1: aggregateProof.publicOutput.voteOptions_1,
        voteOptions_2: aggregateProof.publicOutput.voteOptions_2,
        voteOptions_3: aggregateProof.publicOutput.voteOptions_3,
      });

      this.voteOptions.set(newVoteOptions);

      this.lastAggregatorPubKeyHash.set(Poseidon.hash(lastAggregatorPubKey.toFields()));

      this.emitEvent(
        'Settlement',
        new NewSettlementEvent({
          aggregatorPubKey: lastAggregatorPubKey,
          voteCount: aggregateProof.publicOutput.totalAggregatedCount,
        })
      );
    }

    @method.returns(Vote.VoteOptions)
    async getFinalizedResults() {
      this.account.provedState.requireEquals(Bool(true));
      const currentSlot =
        this.network.globalSlotSinceGenesis.getAndRequireEquals();
      currentSlot.assertGreaterThan(UInt32.from(ELECTION_FINALIZE_SLOT));

      return this.voteOptions.getAndRequireEquals();
    }

    @method
    async redeemSettlementReward(
      aggregatorPubKey: PublicKey,
      aggregatorSignature: Signature,
      reedemerPubKey: PublicKey,
      amount: UInt64
    ) {
      const currentSlot =
        this.network.globalSlotSinceGenesis.getAndRequireEquals();
      currentSlot.assertGreaterThan(UInt32.from(ELECTION_FINALIZE_SLOT));

      const lastAggregatorPubKeyHash =
        this.lastAggregatorPubKeyHash.getAndRequireEquals();

      lastAggregatorPubKeyHash.assertEquals(
        Poseidon.hash(aggregatorPubKey.toFields())
      );

      aggregatorSignature.verify(aggregatorPubKey, [
        lastAggregatorPubKeyHash,
        Poseidon.hash(reedemerPubKey.toFields()),
      ]);

      this.send({
        to: reedemerPubKey,
        amount: amount,
      });
    }
  }

  export class NewSettlementEvent extends Struct({
    aggregatorPubKey: PublicKey,
    voteCount: Field,
  }) {}

  export const fetchElectionState = (
    contractId: string,
    mina_rpc_url: string,
    callback: (error: string | null, state?: ContractState) => any
  ) => {
    fetchAccount({ publicKey: contractId }, mina_rpc_url)
      .then(
        (
          data:
            | { account: Account; error: undefined }
            | { account: undefined; error: FetchError }
        ) => {
          if (!data.account) return callback('bad_request');

          const state = data.account.zkapp?.appState;

          if (!state || state.length != 8) return callback('bad_request');

          return callback(null, convertFieldArrayToContractState(state));
        }
      )
      .catch((err) => {
        return callback(err);
      });
  };
}

export default ElectionNamespace;
