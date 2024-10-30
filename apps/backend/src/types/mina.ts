import { Field } from 'o1js';

export type ElectionData = {
  first: Field;
  last: Field;
};

export type FetchError = {
  statusCode: number;
  statusText: string;
};

export type State = {
  electionData: ElectionData;
  lastAggregatorPubKeyHash: Field;
  voteOptions: VoteOptions;
  maximumCountedVotes: Field;
};

export type VoteOptions = {
  voteOptions_1: Field;
  voteOptions_2: Field;
  voteOptions_3: Field;
  voteOptions_4: Field;
};