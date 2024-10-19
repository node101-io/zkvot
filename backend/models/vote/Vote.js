const mongoose = require('mongoose');

const verifyVote = require('./functions/verifyVote');
const writeZKProofToAvailIfChosen = require('./functions/writeZKProofToAvailIfChosen');
const writeZKProofToCelestiaIfChosen = require('./functions/writeZKProofToCelestiaIfChosen');

const Election = require('../election/Election');

const validator = require('../../utils/validator');

const DA_LAYERS = [ 'avail', 'celestia' ];
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
  block_height: {
    type: Number,
    required: true,
  },
  tx_hash: {
    type: Object,
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

  if (!validator(data.da_layer, { required: true, type: "string" }) ||
      !validator(data.election_contract_id, { required: true, type: "string" }) ||
      !validator(data.nullifier, { required: true, type: "string" }) ||
      !validator(data.proof, { required: true, type: "object" })
  ) return callback('bad_request');

  if (!DA_LAYERS.includes(data.da_layer)) return callback('bad_request');

  Vote._checkIfVoteExists(data.nullifier, (error, exists) => {
    if (error) return callback(error);
    if (exists) return callback('duplicated_unique_field');

    Election.checkIfElectionExists(data.election_contract_id, (error, exists) => {
      if (error) return callback(error);
      if (!exists) return callback('bad_request');

      verifyVote({ proof: data.proof, nullifier: data.nullifier }, (error, verified) => {
        if (error) return callback(error);
        if (!verified) return callback('bad_request');

        writeZKProofToAvailIfChosen(data, (error, availResult) => {
          if(error) return callback(error);

          writeZKProofToCelestiaIfChosen(data, (error, celestiaResult) => {
            if (error) return callback(error);

            const vote = new Vote({
              election_contract_id: data.election_contract_id,
              da_layer: data.da_layer,
              nullifier: data.nullifier,
              block_height: availResult ? availResult.blockHeight : celestiaResult.blockHeight,
              tx_hash: availResult ? availResult.txHash : null,
            });

            vote.save((error, vote) => {
              if (error && error.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');

              if (error) return callback('bad_request');

              return callback(null, vote);
            });
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
