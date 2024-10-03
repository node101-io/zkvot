const mongoose = require('mongoose');

const checkContractFromMina = require('./functions/checkContractFromMina');
const fetchDataFromStorageLayer = require('./functions/fetchDataFromStorageLayer');

const validator = require('../../utils/validator')

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const ElectionSchema = new mongoose.Schema({
  mina_contract_id: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  end_block: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  options: [{
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  }],
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  image_url: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  image_raw: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  voters_list: [{
      type: Object,
      required: true,
  }],
  communication_layers: [{
    type: { // celestia || avail
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    },
    start_block: {//For both celestia and avail
      type: Number,
      required: true,
    },
    namespace: {//Celestia
      type: String,
      required: false,
      trim: true,
      minlength: 1,
      maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    },
    block_hash: {//Celestia
      type: String,
      required: false,
      trim: true,
      minlength: 1,
      maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    },
    app_id: {//Avail
      type: Number,
      required: false,
      trim: true,
      minlength: 1,
      maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    }
  }],
}); 

ElectionSchema.statics.createElection = function (data, callback) {
  const Election = this;
  
  if (!validator(data, { type: 'object' })) return callback('bad_request');

  if(!validator(data.mina_contract_id, { type: 'string' }) ||
     !validator(data.storage_id, { type: 'string' }) ||
     !validator(data.storage_platform, { type: 'string' }) ||
     !validator(data.da_layer, { type: 'string' }) 
    ) return callback('bad_request');

  const mina_contract_id = data.mina_contract_id;

  // TODO: Check if the contract is valid or fetch the storage id from the contract.

  fetchDataFromStorageLayer(data.storage_platform, data.storage_id, (error, data) => {
    if (error) return callback('database_error');

    if (!validator(data.end_block, { type: 'number' }) ||
        !validator(data.question, { type: 'string' }) || 
        !validator(data.options, { type: 'array' }) || 
        !validator(data.description, { type: 'string' }) ||
        !validator(data.image_url, { type: 'string', required: false }) ||
        !validator(data.image_raw, { type: 'string', required: false }) ||
        !validator(data.voters_list, { type: 'array' }) || 
        !validator(data.communication_layers, { type: 'array' })
      ) return callback('bad_request');

        if (!data.image_url && !data.image_raw) return callback('bad_request');

    const electionData = {
      mina_contract_id: mina_contract_id,
      end_block: data.end_block,
      question: data.question,
      options: data.options,
      description: data.description,
      image_url: data.image_url,
      image_raw: data.image_raw,
      voters_list: data.voters_list,
      communication_layers: data.communication_layers,
    };

    const election = new Election(electionData);
    election.save((error, election) => {
      if (error) {
        if (error.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');
        return callback('database_error');
      }
      return callback(null, election);
    });
  });
};

ElectionSchema.index({ mina_contract_id: 1 });

module.exports = mongoose.model('Election', ElectionSchema);