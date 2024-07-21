import { Field, SmartContract, State, state } from 'o1js';

export class Voting extends SmartContract {
  @state(Field) nullifierRoot = State<Field>();

  @state(Field) votersRoot = State<Field>();

  @state(Field) status = State<Field>();
}
