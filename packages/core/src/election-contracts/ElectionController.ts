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
  UInt32,
  Provable,
} from 'o1js';

import Vote from '../vote/Vote.js';

namespace ElectionControllerNamespace {
  type FetchError = {
    statusCode: number;
    statusText: string;
  };

  export type electionControllerBase = SmartContract & {
    storageLayerInfoEncoding: State<StorageLayerInfoEncoding>;
    storageLayerCommitment: State<Field>;
    votersRoot: State<Field>;
    electionStartEndSlots: State<Field>;
  };

  export function compressSlots(arr: UInt32[]): Field {
    let acc = Field.from(0);
    let shift = Field.from(1);
    for (let i = 1; i >= 0; i--) {
      const byte = arr[i];
      byte.value.assertLessThanOrEqual(4294967295);
      acc = acc.add(byte.value.mul(shift));
      shift = shift.mul(4294967296);
    }
    return acc;
  }

  export function seperateSlots(options: Field): UInt32[] {
    let bytes = Provable.witness(Provable.Array(UInt32, 2), () => {
      let w = options.toBigInt();
      return Array.from({ length: 2 }, (_, k) => {
        return UInt32.from((w >> BigInt(32 * (1 - k))) & 0xffffffffn);
      });
    });

    compressSlots(bytes).assertEquals(options);

    return bytes;
  }

  const convertFieldArrayToContractState = (fields: Field[]): ContractState => {
    return {
      storageLayerInfoEncoding: {
        first: fields[0],
        last: fields[1],
      },
      storageLayerCommitment: fields[2],
      lastAggregatorPubKeyHash: fields[3],
      voteOptions: new Vote.VoteOptions({
        options: fields.slice(4, 6),
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

  export class StorageLayerInfoEncoding extends Struct({
    first: Field,
    last: Field,
  }) {}

  export class Contract
    extends SmartContract
    implements electionControllerBase
  {
    // prettier-ignore
    @state(StorageLayerInfoEncoding) storageLayerInfoEncoding = State<StorageLayerInfoEncoding>();
    @state(Field) storageLayerCommitment = State<Field>();
    @state(Field) votersRoot = State<Field>();
    @state(Field) electionStartEndSlots = State<Field>();

    readonly events = {
      NewAggregation: NewAggregationEvent,
      Settlement: ReducedSettlementEvent,
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
      storageLayerCommitment: Field,
      votersRoot: Field,
      electionStartSlot: UInt32,
      electionFinalizeSlot: UInt32
    ) {
      super.init();
      this.account.provedState.requireEquals(Bool(false));

      this.storageLayerInfoEncoding.set(storageLayerInfoEncoding);
      this.storageLayerCommitment.set(storageLayerCommitment);
      this.votersRoot.set(votersRoot);
      this.electionStartEndSlots.set(
        compressSlots([electionStartSlot, electionFinalizeSlot])
      );
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

export default ElectionControllerNamespace;
