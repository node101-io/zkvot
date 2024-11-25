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
  UInt32
} from 'o1js';

import Aggregation from './Aggregation.js';

const MINA_MAINNET_NODE_GRAPHQL = 'https://api.minascan.io/node/mainnet/v1/graphql';

let ELECTION_START_BLOCK: number;
let ELECTION_FINALIZE_BLOCK: number;
let VOTERS_ROOT: bigint;

namespace ElectionNamespace {
  type FetchError = {
    statusCode: number;
    statusText: string;
  };

  const convertFieldArrayToContractState = (
    fields: Field[]
  ): ContractState => {
    return {
      storageLayerInfoEncoding: {
        first: fields[0],
        last: fields[1]
      },
      lastAggregatorPubKeyHash: fields[2],
      voteOptions: {
        voteOptions_1: fields[3],
        voteOptions_2: fields[4],
        voteOptions_3: fields[5],
        voteOptions_4: fields[6]
      },
      maximumCountedVotes: fields[7]
    };
  };

  export const ContractErrors = {};

  export type ContractState = {
    storageLayerInfoEncoding: StorageLayerInfoEncoding,
    lastAggregatorPubKeyHash: Field,
    voteOptions: VoteOptions,
    maximumCountedVotes: Field
  };

  export const setContractConstants = (data: {
    electionStartBlock: number;
    electionFinalizeBlock: number;
    votersRoot: bigint;
  }) => {
    ELECTION_START_BLOCK = data.electionStartBlock;
    ELECTION_FINALIZE_BLOCK = data.electionFinalizeBlock;
    VOTERS_ROOT = data.votersRoot;
  };
  
  export class StorageLayerInfoEncoding extends Struct({
    first: Field,
    last: Field,
  }) {};
  
  export class VoteOptions extends Struct({
    voteOptions_1: Field,
    voteOptions_2: Field,
    voteOptions_3: Field,
    voteOptions_4: Field,
  }) {
    static empty(): VoteOptions {
      return new VoteOptions({
        voteOptions_1: Field.from(0),
        voteOptions_2: Field.from(0),
        voteOptions_3: Field.from(0),
        voteOptions_4: Field.from(0),
      });
    }
  };
  
  export class Contract extends SmartContract {
    @state(StorageLayerInfoEncoding) storageLayerInfoEncoding = State<StorageLayerInfoEncoding>();
  
    @state(Field) lastAggregatorPubKeyHash = State<Field>();
  
    @state(VoteOptions) voteOptions = State<VoteOptions>();
  
    @state(Field) maximumCountedVotes = State<Field>();
  
    readonly events = {
      Settlement: NewSettlementEvent,
    };
  
    async deploy() {
      await super.deploy();
      this.account.permissions.set({
        ...Permissions.default(),
        send: Permissions.proof(),
        setVerificationKey:
          Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      });
    }
  
    @method
    async initialize(storageLayerInfoEncoding: StorageLayerInfoEncoding) {
      this.account.provedState.requireEquals(Bool(false));
  
      this.storageLayerInfoEncoding.set(storageLayerInfoEncoding);
      this.voteOptions.set(VoteOptions.empty());
      this.maximumCountedVotes.set(Field.from(0));
    }
  
    @method
    async settleVotes(
      aggregateProof: Aggregation.Proof,
      lastAggregatorPubKey: PublicKey
    ) {
      // this.account.provedState.requireEquals(Bool(true));
  
      aggregateProof.verify();
  
      aggregateProof.publicInput.electionId.assertEquals(this.address);
      aggregateProof.publicInput.votersRoot.assertEquals(Field.from(VOTERS_ROOT));
  
      // this.network.globalSlotSinceGenesis.requireBetween(
      //   UInt32.from(ELECTION_START_BLOCK),
      //   UInt32.from(ELECTION_FINALIZE_BLOCK)
      // );
  
      let currentMaximumCountedVotes =
        this.maximumCountedVotes.getAndRequireEquals();
  
      currentMaximumCountedVotes.assertLessThan(
        aggregateProof.publicOutput.totalAggregatedCount
      );
  
      this.maximumCountedVotes.set(
        aggregateProof.publicOutput.totalAggregatedCount
      );
  
      const newVoteOptions = new VoteOptions({
        voteOptions_1: aggregateProof.publicOutput.voteOptions_1,
        voteOptions_2: aggregateProof.publicOutput.voteOptions_2,
        voteOptions_3: aggregateProof.publicOutput.voteOptions_3,
        voteOptions_4: aggregateProof.publicOutput.voteOptions_4,
      });
  
      this.voteOptions.set(newVoteOptions);
  
      this.lastAggregatorPubKeyHash.set(
        Poseidon.hash(lastAggregatorPubKey.toFields())
      );
  
      this.emitEvent(
        'Settlement',
        new NewSettlementEvent({
          aggregatorPubKey: lastAggregatorPubKey,
          voteCount: aggregateProof.publicOutput.totalAggregatedCount,
        })
      );
    }
  
    @method.returns(VoteOptions)
    async getFinalizedResults() {
      this.account.provedState.requireEquals(Bool(true));
      // this.network.blockchainLength.getAndRequireEquals();
      // this.network.blockchainLength.requireBetween(
      //   UInt32.from(ELECTION_FINALIZE_BLOCK),
      //   UInt32.MAXINT()
      // );
      return this.voteOptions.getAndRequireEquals();
    }
  
    @method
    async redeemSettlementReward(
      aggregatorPubKey: PublicKey,
      aggregatorSignature: Signature,
      reedemerPubKey: PublicKey,
      amount: UInt64
    ) {
      this.account.provedState.requireEquals(Bool(true));
      // this.network.blockchainLength.getAndRequireEquals();
      // this.network.blockchainLength.requireBetween(
      //   UInt32.from(ELECTION_FINALIZE_BLOCK),
      //   UInt32.MAXINT()
      // );
  
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
  };
  
  export class NewSettlementEvent extends Struct({
    aggregatorPubKey: PublicKey,
    voteCount: Field,
  }) {};

  export const fetchElectionState = (
    contractId: string,
    callback: (
      error: string | null,
      state?: ContractState
    ) => any
  ) => {
    fetchAccount(
      { publicKey: contractId },
      MINA_MAINNET_NODE_GRAPHQL
    )
      .then((data:
        { account: Account; error: undefined; } |
        { account: undefined; error: FetchError }
      ) => {
        if (!data.account)
          return callback('bad_request');

        const state = data.account.zkapp?.appState;

        if (!state || state.length != 8)
          return callback('bad_request');

        return callback(null, convertFieldArrayToContractState(state));
      })
      .catch(_ => callback('bad_request'));
  };
};

export default ElectionNamespace;