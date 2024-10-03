const mongoose = require('mongoose');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const VoteSchema = new mongoose.Schema({
  election_database_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  election_contract_id: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  submit_tx: {
    type: Object,
    required: true,
  },
  nullifier: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
}); 

module.exports = mongoose.model('Vote', VoteSchema);
