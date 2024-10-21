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

// example constants
const ELECTION_START_HEIGHT = 140;
const ELECTION_FINALIZE_HEIGHT = 150;
const VOTERS_ROOT =
  9980342968624030084106297645024923555286525192527553920497338717791905606678n;

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
  }

  @method
  async settleVotes(
    aggregateProof: AggregateProof,
    lastAggregatorPubKey: PublicKey
  ) {
    this.account.provedState.requireEquals(Bool(true));

    aggregateProof.verify();
    aggregateProof.publicInput.electionId.assertEquals(this.address);
    aggregateProof.publicInput.votersRoot.assertEquals(Field.from(VOTERS_ROOT));

    this.network.blockchainLength.getAndRequireEquals();

    this.network.blockchainLength.requireBetween(
      UInt32.from(ELECTION_START_HEIGHT),
      UInt32.from(ELECTION_FINALIZE_HEIGHT)
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
    this.network.blockchainLength.getAndRequireEquals();
    this.network.blockchainLength.requireBetween(
      UInt32.from(ELECTION_FINALIZE_HEIGHT),
      UInt32.MAXINT()
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
    this.network.blockchainLength.getAndRequireEquals();
    this.network.blockchainLength.requireBetween(
      UInt32.from(ELECTION_FINALIZE_HEIGHT),
      UInt32.MAXINT()
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
