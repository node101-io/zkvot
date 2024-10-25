import {
  Field,
  method,
  SmartContract,
  Permissions,
  State,
  state,
  PublicKey,
  Bool,
  Struct,
  UInt32,
  Poseidon,
  Signature,
  UInt64,
} from 'o1js';
import { AggregateProof } from './RangeAggregationProgram.js';

export const ElectionContractErrors = {};

let ELECTION_START_TIMESTAMP: number;
let ELECTION_FINALIZE_TIMESTAMP: number;
let VOTERS_ROOT: bigint;

export const setElectionContractConstants = (data: {
  electionStartTimestamp: number;
  electionFinalizeTimestamp: number;
  votersRoot: bigint;
}) => {
  ELECTION_START_TIMESTAMP = data.electionStartTimestamp;
  ELECTION_FINALIZE_TIMESTAMP = data.electionFinalizeTimestamp;
  VOTERS_ROOT = data.votersRoot;
};

export class ElectionData extends Struct({
  first: Field,
  last: Field,
}) {}

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
}

export class ElectionContract extends SmartContract {
  @state(ElectionData) electionData = State<ElectionData>();

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
  async initialize(electionData: ElectionData) {
    this.account.provedState.requireEquals(Bool(false));

    this.electionData.set(electionData);
    this.voteOptions.set(VoteOptions.empty());
    this.maximumCountedVotes.set(Field.from(0));
  }

  @method
  async settleVotes(
    aggregateProof: AggregateProof,
    lastAggregatorPubKey: PublicKey
  ) {
    // this.account.provedState.requireEquals(Bool(true));

    aggregateProof.verify();
    aggregateProof.publicInput.electionId.assertEquals(this.address);
    aggregateProof.publicInput.votersRoot.assertEquals(Field.from(VOTERS_ROOT));

    // this.network.timestamp.getAndRequireEquals();

    this.network.timestamp.requireBetween(
      UInt64.from(ELECTION_START_TIMESTAMP),
      UInt64.from(ELECTION_FINALIZE_TIMESTAMP)
    );

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
    this.network.timestamp.getAndRequireEquals();
    this.network.timestamp.requireBetween(
      UInt64.from(ELECTION_FINALIZE_TIMESTAMP),
      UInt64.MAXINT()
    );
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
    this.network.timestamp.getAndRequireEquals();
    this.network.timestamp.requireBetween(
      UInt64.from(ELECTION_FINALIZE_TIMESTAMP),
      UInt64.MAXINT()
    );

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
