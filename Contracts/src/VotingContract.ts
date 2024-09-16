import {
  Field,
  method,
  SmartContract,
  Permissions,
  State,
  state,
  PublicKey,
  Bool,
  AccountUpdate,
} from 'o1js';

export const VotingContractErrors = {};

export class VotingContract extends SmartContract {
  @state(Field) votersRoot = State<Field>();

  /**
   * 0: Default
   * 1: Initialized
   * 2: Started
   * 3: Ended
   */
  @state(Field) status = State<Field>();

  @state(Field) votersData = State<Field>();

  @state(PublicKey) votingOwner = State<PublicKey>();

  readonly events = {};

  async deploy() {
    await super.deploy();
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
      editActionState: Permissions.proofOrSignature(),
      incrementNonce: Permissions.proofOrSignature(),
      setPermissions: Permissions.proofOrSignature(),
    });
  }

  private onlyVotingOwner() {
    const votingOwner = this.votingOwner.getAndRequireEquals();
    AccountUpdate.create(votingOwner).requireSignature();
  }

  @method
  async initialize(
    votersRoot: Field,
    votingOwner: PublicKey,
    votersData: Field
  ) {
    this.account.provedState.requireEquals(Bool(false));

    this.votersRoot.set(votersRoot);
    this.votingOwner.set(votingOwner);
    this.votersData.set(votersData);
    this.status.set(Field.from(1));
  }

  @method
  async startVoting() {
    this.onlyVotingOwner();
    this.status.set(Field.from(2));
  }
}
