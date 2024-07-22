import { Field, method, SmartContract, Permissions, State, state } from 'o1js';

export class Voting extends SmartContract {
  @state(Field) nullifierRoot = State<Field>();

  @state(Field) votersRoot = State<Field>();

  /**
   * 0: Not started
   * 1: Started
   * 2: Finalized
   */
  @state(Field) status = State<Field>();

  @state(Field) votingID = State<Field>();

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

  @method
  async setVotingID(id: Field) {
    this.status.getAndRequireEquals().assertEquals(Field.from(0));
    this.votingID.set(id);
  }

  @method
  async voterRegistration(votersRoot: Field) {
    this.status.getAndRequireEquals().assertEquals(Field.from(0));
    this.votersRoot.set(votersRoot);
  }

  @method
  async submitAggregatedVotes() {}

  @method
  async startVoting() {}

  @method
  async finalizeVoting() {}
}
