import { model, Model, Schema } from 'mongoose';

import isBase64String from '../../utils/isBase64String.js';
import decodeFromBase64String from '../../utils/decodeFromBase64String.js';

import Election from '../election/Election.js';

import verifyVote from './functions/verifyVote.js';
import submitVote from './functions/submitVote.js';

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

interface VoteStatics {
  createAndSubmitVote: (
    data: {
      vote: string;
      election_contract_id: string;
      da_layer: 'avail' | 'celestia';
    },
    callback: (error: string | null, result?: {
      block_height: number,
      tx_hash: string
    }) => any
  ) => any;
};

const VoteSchema = new Schema({
  election_contract_id: {
    type: String,
    required: true,
  },
  nullifier: {
    type: BigInt,
    required: true,
    unique: true
  },
  da_layer: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  block_height: {
    type: Number,
    required: true,
  },
  tx_hash: {
    type: Object,
  }
});

VoteSchema.statics.createAndSubmitVote = function (
  data: {
    vote: string;
    election_contract_id: string;
    da_layer: 'avail' | 'celestia';
  },
  callback: (error: string | null, vote?: any) => any
) {
  const Vote = this;

  if (!isBase64String(data.vote))
    return callback('bad_request');

  Election.findElectionByContractId(data.election_contract_id, (err, election) => {
    if (err)
      return callback(err);
    if (!election)
      return callback('bad_request');

    if (!election.communication_layers.find(layer => layer.name == data.da_layer))
      return callback('bad_request');

    decodeFromBase64String(data.vote, (err, jsonProof) => {
      if (err || !jsonProof)
        return callback(err);

      verifyVote({
        vote: jsonProof,
        electionId: election.mina_contract_id,
        merkleRoot: election.voters_merkle_root
      }, (err, nullifier) => {
        if (err)
          return callback(err);
        if (!nullifier)
          return callback('bad_request');

        Vote
          .findOne({ nullifier })
          .then((vote: any) => {
            if (vote)
              return callback('vote_already_sent');

            const submitVoteData: any = {
              proof: data.vote,
              da_layer: data.da_layer
            };

            if (data.da_layer == 'avail')
              submitVoteData.app_id = election.communication_layers.find(layer => layer.name == data.da_layer)?.app_id;
            else if (data.da_layer == 'celestia')
              submitVoteData.namespace = election.communication_layers.find(layer => layer.name == data.da_layer)?.namespace;
            else
              return callback('not_possible_error');

            submitVote(submitVoteData, (err, result) => {
              const vote = new Vote({
                election_contract_id: data.election_contract_id,
                da_layer: data.da_layer,
                nullifier,
                block_height: result?.blockHeight,
                tx_hash: result?.txHash,
              });

              vote.save((err: any, vote: any) => {
                if (err && err.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');
                if (err) return callback('bad_request');

                return callback(null, {
                  block_height: result?.blockHeight,
                  tx_hash: result?.txHash
                });
              });
            });
          })
          .catch((err: any) => callback('database_error'));
      });
    });
  });
};

export default model('Vote', VoteSchema) as Model<any> & VoteStatics;
