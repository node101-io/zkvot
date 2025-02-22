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
  UInt32,
  Provable,
  Experimental,
  assert,
  AccountUpdate,
  UInt64,
} from 'o1js';

const { BatchReducer } = Experimental;

// import Aggregation from './Aggregation.js';
import Aggregation from '../aggregation-programs/AggregationMM.js';
import ElectionController from './ElectionController.js';

import Vote from '../vote/Vote.js';

namespace ElectionNamespace {
  type FetchError = {
    statusCode: number;
    statusText: string;
  };

  const convertFieldArrayToContractState = (fields: Field[]): ContractState => {
    return {
      controller: PublicKey.fromFields(fields.slice(0, 1)),
      electionState: new ElectionState({
        lastAggregatorPubKeyHash: fields[1],
        voteOptions: new Vote.VoteOptions({
          options: fields.slice(2, 4),
        }),
        maximumCountedVotes: fields[4],
      }),
    };
  };

  export const ContractErrors = {
    controllerNotFethed: 'Controller could not be fetched',
    votersRootNotFetched: 'Voters root could not be fetched',
    electionSlotsNotFetched: 'Election slots could not be fetched',
    votersRootMismatch: 'Voters root mismatch',
    electionNotStarted: 'Election not started yet',
    electionFinalized: 'Election finalized',
    electionNotFinalized: 'Election not finalized yet',
    lessThanMaximum:
      'You are trying to settle proof with less votes than the current maximum',
    aggregatorMismatch: 'Aggregator public key hash does not match',
  };

  export type ContractState = {
    controller: PublicKey;
    electionState: ElectionState;
  };

  export class ElectionState extends Struct({
    lastAggregatorPubKeyHash: Field,
    voteOptions: Vote.VoteOptions,
    maximumCountedVotes: Field,
  }) {
    toFields(): Field[] {
      return [
        this.lastAggregatorPubKeyHash,
        ...this.voteOptions.toFields(),
        this.maximumCountedVotes,
      ];
    }

    static empty(): ElectionState {
      return new ElectionState({
        lastAggregatorPubKeyHash: Field.from(0),
        voteOptions: Vote.VoteOptions.empty(),
        maximumCountedVotes: Field.from(0),
      });
    }
  }

  let batchReducer = new BatchReducer({
    actionType: ElectionState,
    // tentative values for fast testing
    batchSize: 3,
    maxUpdatesFinalProof: 4,
    maxUpdatesPerProof: 4,
  });

  export const BatchReducerInstance = batchReducer;
  export class Batch extends batchReducer.Batch {}
  export class BatchProof extends batchReducer.BatchProof {}

  export class Contract extends SmartContract {
    @state(PublicKey) controller = State<PublicKey>();
    @state(ElectionState) electionState = State<ElectionState>();
    @state(Field) actionState = State(BatchReducer.initialActionState);
    @state(Field) actionStack = State(BatchReducer.initialActionStack);

    readonly events = {
      NewAggregation: NewAggregationEvent,
      Settlement: ReducedSettlementEvent,
    };

    static controllerContract: new (
      ...args: any
    ) => ElectionController.ElectionControllerBase =
      ElectionController.Contract;

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
    async initialize(controller: PublicKey, settlerReward: UInt64) {
      super.init();

      this.controller.set(controller);
      this.account.provedState.requireEquals(Bool(false));
      this.electionState.set(ElectionState.empty());

      const accountUpdate = AccountUpdate.createSigned(
        this.sender.getAndRequireSignature()
      );

      accountUpdate.send({ to: this.address, amount: settlerReward });
    }

    /**
     * @returns The balance of the contract.
     */
    async getContractBalance() {
      const accountUpdate = AccountUpdate.create(this.address);
      const tokenBalance = accountUpdate.account.balance.get(); // getAndReqEq ??
      return tokenBalance;
    }

    async getControllerContract(): Promise<ElectionController.ElectionControllerBase> {
      const controller = await Provable.witnessAsync(PublicKey, async () => {
        let pk = await this.controller.fetch();
        assert(pk !== undefined, ContractErrors.controllerNotFethed);
        return pk;
      });
      this.controller.requireEquals(controller);
      return new ElectionNamespace.Contract.controllerContract(controller);
    }

    async getControllerConstants(): Promise<{
      votersRoot: Field;
      electionStartSlot: UInt32;
      electionFinalizeSlot: UInt32;
    }> {
      const controller = await this.getControllerContract();

      const [votersRoot, electionStartEndSlots] = await Provable.witnessAsync(
        Provable.Array(Field, 2),
        async () => {
          let votersRoot = await controller.votersRoot.fetch();
          assert(votersRoot !== undefined, ContractErrors.votersRootNotFetched);
          let electionStartEndSlots =
            await controller.electionStartEndSlots.fetch();
          assert(
            electionStartEndSlots !== undefined,
            ContractErrors.electionSlotsNotFetched
          );
          return [votersRoot, electionStartEndSlots];
        }
      );

      controller.votersRoot.requireEquals(votersRoot);
      controller.electionStartEndSlots.requireEquals(electionStartEndSlots);

      const [electionStartSlot, electionFinalizeSlot] =
        ElectionController.seperateSlots(electionStartEndSlots);

      return {
        votersRoot,
        electionStartSlot,
        electionFinalizeSlot,
      };
    }

    /**
     * Settle votes for the current election. This method is called by the aggregator to settle the votes for the current election.
     * **Must be reduced after the method call**
     * @param aggregateProof calculated proof of the aggregation
     * @param lastAggregatorPubKey public key of the aggregator to redeem the reward
     *
     * @require The current slot to be greater than the election start slot and less than the election finalize slot
     * @require The number of counted votes so far to be less than the total number of votes in the aggregate proof to prevent spamming
     *
     * @emits Settlement event with the aggregator public key and the vote count
     */
    @method
    async settleVotes(
      aggregateProof: Aggregation.Proof,
      lastAggregatorPubKey: PublicKey
    ) {
      aggregateProof.verify();

      const { votersRoot, electionStartSlot, electionFinalizeSlot } =
        await this.getControllerConstants();

      aggregateProof.publicInput.electionPubKey.assertEquals(this.address);
      aggregateProof.publicInput.votersRoot.assertEquals(
        votersRoot,
        ContractErrors.votersRootMismatch
      );

      const currentSlot =
        this.network.globalSlotSinceGenesis.getAndRequireEquals();
      currentSlot.assertGreaterThanOrEqual(
        electionStartSlot,
        ContractErrors.electionNotStarted
      );
      currentSlot.assertLessThan(
        electionFinalizeSlot,
        ContractErrors.electionFinalized
      );

      let currentElectionState = this.electionState.getAndRequireEquals();

      currentElectionState.maximumCountedVotes.assertLessThan(
        aggregateProof.publicOutput.totalAggregatedCount,
        ContractErrors.lessThanMaximum
      );

      batchReducer.dispatch(
        new ElectionState({
          lastAggregatorPubKeyHash: Poseidon.hash(
            lastAggregatorPubKey.toFields()
          ),
          voteOptions: aggregateProof.publicOutput.voteOptions,
          maximumCountedVotes: aggregateProof.publicOutput.totalAggregatedCount,
        })
      );

      this.emitEvent(
        'NewAggregation',
        new NewAggregationEvent({
          aggregatorPubKey: lastAggregatorPubKey,
          voteCount: aggregateProof.publicOutput.totalAggregatedCount,
        })
      );
    }

    /**
     * Reduces the batch and updates the election state with the new aggregation proof that has the maximum counted votes
     * @param batch Actions batch
     * @param proof Batch proof
     */
    @method
    async reduce(batch: Batch, proof: BatchProof) {
      let latestElectionState = this.electionState.getAndRequireEquals();

      batchReducer.processBatch({ batch, proof }, (newState, isDummy) => {
        let iteratedState = Provable.if(
          isDummy,
          ElectionState.empty(),
          newState
        );

        latestElectionState = Provable.if(
          iteratedState.maximumCountedVotes.greaterThan(
            latestElectionState.maximumCountedVotes
          ),
          iteratedState,
          latestElectionState
        );
      });

      this.electionState.set(latestElectionState);

      this.emitEvent(
        'Settlement',
        new ReducedSettlementEvent({
          aggregatorPubKeyHash: latestElectionState.lastAggregatorPubKeyHash,
          voteCount: latestElectionState.maximumCountedVotes,
          voteOptions: latestElectionState.voteOptions,
        })
      );
    }

    @method.returns(Vote.VoteOptions)
    async getFinalizedResults() {
      this.account.provedState.requireEquals(Bool(true));
      const currentSlot =
        this.network.globalSlotSinceGenesis.getAndRequireEquals();

      const { electionFinalizeSlot } = await this.getControllerConstants();

      currentSlot.assertGreaterThan(
        electionFinalizeSlot,
        ContractErrors.electionNotFinalized
      );

      return this.electionState.getAndRequireEquals().voteOptions;
    }

    /**
     * Redeem the reward for the settlement of the votes. This method is called by the aggregator that has the maximum counted votes.
     * @param aggregatorPubKey Public key of the aggregator that will redeem the reward
     * @param aggregatorSignature
     * @param reedemerPubKey
     */
    @method
    async redeemSettlementReward(
      aggregatorPubKey: PublicKey,
      aggregatorSignature: Signature,
      reedemerPubKey: PublicKey
    ) {
      const currentSlot =
        this.network.globalSlotSinceGenesis.getAndRequireEquals();
      const { electionFinalizeSlot } = await this.getControllerConstants();
      currentSlot.assertGreaterThan(
        electionFinalizeSlot,
        ContractErrors.electionNotFinalized
      );

      const lastAggregatorPubKeyHash =
        this.electionState.getAndRequireEquals().lastAggregatorPubKeyHash;

      lastAggregatorPubKeyHash.assertEquals(
        Poseidon.hash(aggregatorPubKey.toFields()),
        ContractErrors.aggregatorMismatch
      );

      // Todo salt or another way to prevent replay attacks, or maybe it's not needed
      aggregatorSignature.verify(aggregatorPubKey, [
        lastAggregatorPubKeyHash,
        Poseidon.hash(reedemerPubKey.toFields()),
      ]);

      const amount = await this.getContractBalance();

      this.send({
        to: reedemerPubKey,
        amount,
      });
    }
  }

  export class NewAggregationEvent extends Struct({
    aggregatorPubKey: PublicKey,
    voteCount: Field,
  }) {}

  export class ReducedSettlementEvent extends Struct({
    aggregatorPubKeyHash: Field,
    voteCount: Field,
    voteOptions: Vote.VoteOptions,
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
