const mongoose = require('mongoose');

const verifyVote = require('./functions/verifyVote');
const writeToAvail = require('./functions/writeToAvail');

const Election = require('../election/Election');

const validator = require('../../utils/validator');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const VoteSchema = new mongoose.Schema({
  election_contract_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  da_layer: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  block_hash: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  tx_hash: {
    type: Object,
    required: true,
  },
  nullifier: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
}); 

VoteSchema.index({ nullifier: 1 }, { unique: true });

VoteSchema.statics.createVote = function (data, callback) {
  const Vote = this;

  if (!validator(data, { required: true, type: "object" })) return callback('bad_request');

  if (!validator(data.election_contract_id, { required: true, type: "string" }) ||
      !validator(data.nullifier, { required: true, type: "string" }) ||
      !validator(data.proof, { required: true, type: "string" })
  ) return callback('bad_request');

  Vote._checkIfVoteExists(data.nullifier, (error, exists) => {
    if (error) return callback(error);
    if (exists) return callback('document_already_exists');

    Election.checkIfElectionExists(data.election_contract_id, (error, exists) => {
      if (error) return callback(error);
      if (!exists) return callback('bad_request');

      verifyVote({ proof: data.proof, nullifier: data.nullifier }, (error, verified) => {
        if (error) return callback(error);
        if (!verified) return callback('bad_request');
  
        writeToAvail(data, (error, tx_results) => {
          if (error) return callback("da_layer_error");
  
          if (!validator(tx_results, { required: true, type: "object" })) return callback('da_layer_error');

          // da layer will be dynamic after celestia integration
          const vote = new Vote({
            election_contract_id: data.election_contract_id,
            da_layer: "avail",
            block_hash: tx_results.blockHash,
            tx_hash: tx_results.txHash,
            nullifier: data.nullifier
          });
    
          vote.save((error, vote) => {
            if (error) {
              if (error.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('document_already_exists');
              return callback('bad_request');
            }
        
            return callback(null, vote);
          });
        });
      });
    });
  });
};

VoteSchema.statics._checkIfVoteExists = function (nullifier, callback) {
  const Vote = this;

  if (!validator(nullifier, { required: true, type: "string" })) return callback('bad_request');

  Vote.exists({ nullifier }, (error, exists) => {
    if (error) return callback('bad_request');
    if (exists) return callback('document_already_exists');

    return callback(null);
  });
}

module.exports = mongoose.model('Vote', VoteSchema);
