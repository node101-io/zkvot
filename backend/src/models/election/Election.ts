import { model, Model, Schema } from 'mongoose';

import { ElectionModel } from '../../types/election.js';

import fetchDataFromStorageLayer from './functions/fetchDataFromStorageLayer.js';
import fetchElectionStateFromMina from './functions/fetchElectionStateFromMina.js';
import generateMerkleRootFromVotersList from './functions/generateMerkleRootFromVotersList.js';
import getStorageInfoFromFields from './functions/getStorageInfoFromFields.js';
import uploadImageRaw from './functions/uploadImageRaw.js';

const DEFAULT_QUERY_LIMIT = 100;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

interface ElectionStatics {
  createElection: (
    data: { mina_contract_id: string },
    callback: (
      error: string | null,
      election?: ElectionModel
    ) => any
  ) => any;
  findElectionByContractId: (
    mina_contract_id: string,
    callback: (
      error: string | null,
      election?: ElectionModel
    ) => any
  ) => any;
  findElectionsByFilter: (
    data: {
      skip?: number;
      text?: string;
      start_after?: Date;
      end_before?: Date;
    },
    callback: (
      error: string | null,
      elections?: ElectionModel[]
    ) => any
  ) => any;
};

const ElectionSchema = new Schema({
  mina_contract_id: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  storage_layer_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  storage_layer_platform: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 1
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  options: [
    {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
    }
  ],
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  image_url: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  voters_list: [
    {
      type: Object,
      required: true
    }
  ],
  voters_merkle_root: {
    type: BigInt,
    required: true
  },
  communication_layers: [
    {
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
    }
  ]
});

ElectionSchema.statics.createElection = function (
  data: { mina_contract_id: string },
  callback: (
    error: string | null,
    election?: ElectionModel
  ) => any
) {
  const Election = this;

  const mina_contract_id = data.mina_contract_id;

  Election.findOne({
    mina_contract_id
  })
  .then((election: ElectionModel) => {
    if (election)
      return callback('duplicated_unique_field');

    fetchElectionStateFromMina(mina_contract_id, (error, state) => {
      if (error)
        return callback(error);
      if (!state)
        return callback('bad_request');

      getStorageInfoFromFields([
        state.electionData.first,
        state.electionData.last
      ], (err, storageInfo) => {
        if (err)
          return callback(err);
        if (!storageInfo)
          return callback('bad_request');

        const storage_layer_id = storageInfo.id;
        const storage_layer_platform = storageInfo.platform;

        fetchDataFromStorageLayer(storage_layer_id, storage_layer_platform, (error, data) => {
          if (error)
            return callback('bad_request');
          if (!data)
            return callback('bad_request');

          const voters_merkle_root = generateMerkleRootFromVotersList(data.voters_list);

          uploadImageRaw(data.image_raw, (error, url) => {
            if (error)
              return callback(error);

            const electionData = {
              mina_contract_id,
              storage_layer_id,
              storage_layer_platform,
              image_url: url,
              voters_merkle_root,
              ...data
            };

            const election = new Election(electionData);

            election.save((error: { code: number; }, election: any) => {
              if (error) {
                if (error.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                  return callback('duplicated_unique_field');
                return callback('database_error');
              }

              return callback(null, election);
            });
          });
        });
      });
    });
  })
  .catch((err: any) => callback('database_error'));
};

ElectionSchema.statics.findElectionByContractId = function (
  mina_contract_id: string,
  callback: (
    error: string | null,
    election?: ElectionModel
  ) => any
) {
  const Election = this;

  Election
    .findOne({ mina_contract_id })
    .then((election: ElectionModel) => {
      if (!election)
        return callback('document_not_found');

      callback(null, election)
    })
    .catch((err: any) => callback('database_error'));
};

ElectionSchema.statics.findElectionsByFilter = function (
  data: {
    skip?: number;
    text?: string;
    start_after?: Date;
    end_before?: Date;
  },
  callback: (
    error: string | null,
    elections?: ElectionModel[]
  ) => any
) {
  const Election = this;

  const filters: any[] = [];

  if (data.text)
    filters.push({
      $or: [
        { question: { $regex: data.text, $options: 'i' } },
        { description: { $regex: data.text, $options: 'i' } }
      ]
    });;

  if (data.start_after)
    filters.push({
      start_date: { $gte: data.start_after }
    });

  if (data.end_before)
    filters.push({
      end_date: { $lte: data.end_before }
    });

  Election
    .find((filters.length > 0) ? { $and: filters } : {})
    .sort({ _id: 1 })
    .skip(data.skip || 0)
    .limit(DEFAULT_QUERY_LIMIT)
    .then((elections: ElectionModel[]) => callback(null, elections))
    .catch((err: any) => callback('database_error'));
};

export default model('Election', ElectionSchema) as Model<any> & ElectionStatics;
