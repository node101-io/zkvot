import { model, Model, Schema } from 'mongoose';
import { JsonProof } from 'o1js';

import { types } from 'zkvot-core';

import aggregate from '../../utils/mina/aggregate.js';
import isBase64String from '../../utils/isBase64String.js';
import decodeFromBase64String from '../../utils/decodeFromBase64String.js';

import Election from '../election/Election.js';

import verifyVote from './functions/verifyVote.js';
import submitVote from './functions/submitVote.js';

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

type VoteType = {
  election_contract_id: string;
  nullifier: string;
  da_layer: types.DaLayerInfo['name'];
  block_height: number;
  tx_hash: string;
  proof: string;
  is_counted: boolean;
};

interface VoteStatics {
  createVote: (
    data: {
      voteProof: string;
      election_contract_id: string;
      da_layer: types.DaLayerInfo['name'];
    },
    callback: (error: string | null, result?: {
      block_height: number,
      tx_hash: string
    }) => any
  ) => any;
  createAndSubmitVote: (
    data: {
      voteProof: string;
      election_contract_id: string;
      da_layer: types.DaLayerInfo['name'];
    },
    callback: (error: string | null, result?: {
      block_height: number,
      tx_hash: string
    }) => any
  ) => any;
  countVote: (
    nullifier: string,
    callback: (error: string | null) => any
  ) => any;
};

const VoteSchema = new Schema({
  election_contract_id: {
    type: String,
    required: true,
  },
  nullifier: {
    type: String,
    required: true,
    unique: true
  },
  vote: {
    type: Number,
    required: true,
    min: 0
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
    default: 0
  },
  tx_hash: {
    type: String,
    default: ''
  },
  proof: { // To be deleted once counted
    type: String,
    default: ''
  },
  is_counted: {
    type: Boolean,
    default: false
  }
});

// TODO: is_devnet parametresi ekle

VoteSchema.statics.createVote = function (
  data: {
    voteProof: string;
    election_contract_id: string;
    da_layer: types.DaLayerInfo['name'];
  },
  callback: (error: string | null, vote?: VoteType) => any
) {
  if (!isBase64String(data.voteProof))
    return callback('bad_request');

  Election.findOrCreateElectionByContractId(data.election_contract_id, (err, election) => {
    if (err)
      return callback(err);
    if (!election)
      return callback('bad_request');

    if (!election.communication_layers.find(layer => layer.name == data.da_layer))
      return callback('bad_request');

    decodeFromBase64String(data.voteProof, (err, jsonProof) => {
      if (err || !jsonProof)
        return callback(err);

      verifyVote({
        vote: jsonProof,
        electionId: election.mina_contract_id,
        merkleRoot: election.voters_merkle_root
      }, (err, voteOutput) => {
        if (err || !voteOutput)
          return callback(err || 'unknown_error');

        const vote = new Vote({
          election_contract_id: data.election_contract_id,
          nullifier: voteOutput.nullifier,
          vote: voteOutput.vote,
          da_layer: data.da_layer,
          proof: JSON.stringify(jsonProof),
          is_counted: false
        });

        vote
          .save()
          .then((vote: any) => {
            callback(null, vote); // Return callback async before counting

            Vote.countVote(vote.nullifier, err => {
              if (err) console.log(err); // Do not send error, submit is succesful, it is not counted only in backend
            });
          })
          .catch((err: any) => {
            if (err.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
              return callback('duplicated_unique_field');
            return callback('bad_request');
          });
      });
    });
  });
};

VoteSchema.statics.createAndSubmitVote = function (
  data: {
    voteProof: string;
    election_contract_id: string;
    da_layer: types.DaLayerInfo['name'];
  },
  callback: (error: string | null, vote?: VoteType) => any
) {
  if (!isBase64String(data.voteProof))
    return callback('bad_request');

  Election.findOrCreateElectionByContractId(data.election_contract_id, (err, election) => {
    if (err || !election)
      return callback(err || 'unknown_error');

    if (!election.communication_layers.find(layer => layer.name == data.da_layer))
      return callback('bad_request');

    decodeFromBase64String(data.voteProof, (err, jsonProof) => {
      if (err || !jsonProof)
        return callback(err);

      verifyVote({
        vote: jsonProof,
        electionId: election.mina_contract_id,
        merkleRoot: election.voters_merkle_root
      }, (err, voteOutput) => {
        if (err || !voteOutput)
          return callback(err || 'unknown_error');

        const submitVoteData: any = {
          proof: data.voteProof,
          da_layer: data.da_layer
        };

        if (data.da_layer == 'Avail')
          submitVoteData.app_id = (election.communication_layers as types.AvailDaLayerInfo[]).find(layer => layer.name == data.da_layer)?.app_id;
        else if (data.da_layer == 'Celestia')
          submitVoteData.namespace = (election.communication_layers as types.CelestiaDaLayerInfo[]).find(layer => layer.name == data.da_layer)?.namespace;
        else
          return callback('not_possible_error');

        submitVote(submitVoteData, (err, result) => {
          if (err)
            return callback(err);

          const vote = new Vote({
            election_contract_id: data.election_contract_id,
            nullifier: voteOutput.nullifier,
            vote: voteOutput.vote,
            da_layer: data.da_layer,
            block_height: result?.blockHeight,
            tx_hash: result?.txHash,
            proof: JSON.stringify(jsonProof),
            is_counted: false
          });

          vote
            .save()
            .then((vote: any) => {
              callback(null, vote); // Return callback async before counting

              Vote.countVote(vote.nullifier, err => {
                if (err) console.log(err); // Do not send error, submit is succesful, it is not counted only in backend
              });
            })
            .catch((err: any) => {
              if (err.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                return callback('duplicated_unique_field');
              return callback('bad_request');
            });
        });
      });
    });
  });
};

VoteSchema.statics.countVote = function (
  nullifier: string,
  callback: (error: string | null) => any
) {
  Vote
    .findOne({ nullifier })
    .then((vote: any) => {
      if (!vote)
        return callback('document_not_found');

      if (vote.is_counted)
        return callback('vote_already_counted');

      Election.findElectionByContractIdAndGetProof(vote.election_contract_id, (err, proof) => {
        if (err || !proof)
          return callback(err || 'unknown_error');

        if (proof.proof.length) {
          aggregate({
            previous_proof_json: proof.proof,
            proof_json: vote.proof,
            previous_voters: proof.previous_voters
          }, (err: any, proof: JsonProof) => {
            if (err)
              return callback(err);

            Election.findElectionByContractIdAndAddVote({
              mina_contract_id: vote.election_contract_id,
              proof,
              new_voter: {
                vote: vote.vote,
                nullifier
              }
            }, err => {
              if (err)
                return callback(err);

              Vote
                .findOneAndUpdate({ nullifier }, {$set: {
                  proof: '',
                  is_counted: true
                }})
                .then(() => callback(null))
                .catch((err: any) => {
                  console.log(err);
                  return callback('database_error');
                });
            });
          });
        } else {
          aggregate({
            proof_json: vote.proof
          }, (err: any, proof: JsonProof) => {
            if (err)
              return callback(err);

            Election.findElectionByContractIdAndAddVote({
              mina_contract_id: vote.election_contract_id,
              proof,
              new_voter: {
                vote: vote.vote,
                nullifier
              }
            }, err => {
              if (err)
                return callback(err);

              Vote
                .findOneAndUpdate({ nullifier }, {$set: {
                  proof: '',
                  is_counted: true
                }})
                .then(() => callback(null))
                .catch((err: any) => {
                  console.log(err);
                  return callback('database_error');
                });
            });
          });
        }       
      });
    })
    .catch((err: any) => callback('database_error'));
};

const Vote = model('Vote', VoteSchema) as Model<any> & VoteStatics;
export default Vote;