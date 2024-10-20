import { Field, fetchAccount, Account } from 'o1js';

import { FetchError, State } from '../../../types/mina';

const MINA_MAINNET_NODE_GRAPHQL = 'https://api.minascan.io/node/mainnet/v1/graphql';

const fieldArrayToState = (
  fields: Field[]
): State => {
  return {
    electionData: {
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

export default (
  contractId: string,
  callback: (
    error: string | null,
    state?: State
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

      return callback(null, fieldArrayToState(state));
    })
    .catch(_ => callback('bad_request'));
};