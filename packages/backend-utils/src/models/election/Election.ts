import { model, Model, Schema } from 'mongoose';
import { JsonProof } from 'o1js';

import {
  Election as ElectionProgram,
  MerkleTree,
  types,
  utils
} from 'zkvot-core';

import ResultProof from '../result-proof/ResultProof.js';

import uploadImageRaw from './functions/uploadImageRaw.js';

type ResultProofType = {
  mina_contract_id: string;
  proof: string;
  previous_voters: {
    vote: number;
    nullifier: string;
  }[];
};

const DEFAULT_QUERY_LIMIT = 100;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MINA_DEVNET_RPC_URL = 'https://api.minascan.io/node/devnet/v1/graphql';
const MINA_MAINNET_RPC_URL = 'https://api.minascan.io/node/mainnet/v1/graphql';

interface ElectionStatics {
  createElection: (
    data: { mina_contract_id: string, is_devnet?: boolean },
    callback: (
      error: string | null,
      election?: types.ElectionBackendData
    ) => any
  ) => any;
  findOrCreateElectionByContractId: (
    data: { mina_contract_id: string, is_devnet?: boolean },
    callback: (
      error: string | null,
      election?: types.ElectionBackendData
    ) => any
  ) => any;
  findElectionsByFilter: (
    data: {
      is_devnet?: boolean;
      skip?: number;
      text?: string;
      start_after?: Date;
      end_before?: Date;
      is_ongoing?: boolean;
    },
    callback: (
      error: string | null,
      elections?: types.ElectionBackendData[]
    ) => any
  ) => any;
  findElectionByContractIdAndGetProof: (
    mina_contract_id: string,
    callback: (
      error: string | null,
      proof?: ResultProofType
    ) => any
  ) => any;
  findElectionByContractIdAndAddVote: (
    data: {
      mina_contract_id: string,
      proof: JsonProof,
      new_voter: {
        vote: number;
        nullifier: string;
      }
    },
    callback: ( error: string | null ) => any
  ) => any;
  findElectionByContractIdAndGetResults: (
    mina_contract_id: string,
    callback: (
      error: string | null,
      data?: {
        result: {
          name: string,
          percentage: number,
          voteCount: string,
        }[],
        proof: string
      }
    ) => any
  ) => any;
};

const ElectionSchema = new Schema({
  is_devnet: {
    type: Boolean,
    default: false
  },
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
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  storage_layer_platform: {
    type: String,
    required: true,
    trim: true,
    length: 1
  },
  start_slot: {
    type: Number,
    required: true
  },
  end_slot: {
    type: Number,
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
    required: false,
    trim: true,
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
    type: String,
    required: true
  },
  communication_layers: [
    {
      name: { // celestia || avail
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
      },
      start_block_height: {//For both celestia and avail
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
      start_block_hash: {//Celestia
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
  ],
  result: [
    {
      type: Number,
      required: true,
      min: 0
    }
  ]
});

ElectionSchema.statics.createElection = function (
  data: { mina_contract_id: string, is_devnet?: boolean },
  callback: (
    error: string | null,
    election?: types.ElectionBackendData
  ) => any
) {
  const { mina_contract_id, is_devnet } = data;

  ElectionProgram.fetchElectionState(mina_contract_id, data.is_devnet ? MINA_DEVNET_RPC_URL : MINA_MAINNET_RPC_URL, (error, state) => {
    if (error)
      return callback(error);
    if (!state)
      return callback('bad_request');

    const storageInfo = utils.decodeStorageLayerInfo(state.storageLayerInfoEncoding);

    utils.fetchDataFromStorageLayer(storageInfo, (error, data) => {
      if (error)
        return callback('bad_request');
      if (!data)
        return callback('bad_request');

      const voters_merkle_root = MerkleTree.createFromStringArray(data.voters_list.map(voter => voter.public_key))?.getRoot().toBigInt().toString();

      uploadImageRaw(data.image_raw, (error, url) => {
        if (error)
          return callback(error);

        const electionData = {
          is_devnet: is_devnet || false,
          mina_contract_id,
          storage_layer_id: storageInfo.id,
          storage_layer_platform: storageInfo.platform,
          image_url: url,
          voters_merkle_root,
          result: Array.from({ length: data.options.length }, () => 0),
          ...data
        };

        const election = new Election(electionData);

        election
          .save()
          .then((election: types.ElectionBackendData) => callback(null, election))
          .catch((err: any) => {
            if (err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
              return callback('duplicated_unique_field');

            console.log(err);
            return callback('database_error');
          });
      });
    });
  });
};

ElectionSchema.statics.findOrCreateElectionByContractId = function (
  data: { mina_contract_id: string, is_devnet?: boolean },
  callback: (
    error: string | null,
    election?: types.ElectionBackendData
  ) => any
) {
  Election
    .findOne({ mina_contract_id: data.mina_contract_id })
    .then((election: types.ElectionBackendData) => {
      if (election)
        return callback(null, election);

      Election.createElection(data, callback);
    })
    .catch((err: any) => callback('database_error'));
};

ElectionSchema.statics.findElectionsByFilter = function (
  data: {
    is_devnet?: boolean;
    skip?: number;
    text?: string;
    start_after?: number;
    end_before?: number;
    is_ongoing?: boolean;
  },
  callback: (
    error: string | null,
    elections?: types.ElectionBackendData[]
  ) => any
) {
  const filters: any[] = [
    { is_devnet: 'is_devnet' in data }
  ];

  if (data.text)
    filters.push({
      $or: [
        { question: { $regex: data.text, $options: 'i' } },
        { description: { $regex: data.text, $options: 'i' } }
      ]
    });;

  if (data.start_after)
    filters.push({
      start_slot: { $gte: data.start_after }
    });

  if (data.end_before)
    filters.push({
      end_slot: { $lte: data.end_before }
    });

  // TODO: fix after migrating to timestamp
  // if ('is_ongoing' in data)
  //   filters.push({
  //     start_slot: { $lte: new Date() },
  //     end_slot: { $gte: new Date() }
  //   });

  Election
    .find((filters.length > 0) ? { $and: filters } : {})
    .find()
    .sort({ _id: 1 })
    .skip(data.skip || 0)
    .then((elections: types.ElectionBackendData[]) => callback(null, elections))
    .catch((err: any) => callback('database_error'));
};

ElectionSchema.statics.findElectionByContractIdAndGetProof = function (
  mina_contract_id: string,
  callback: (
    error: string | null,
    proof?: ResultProofType
  ) => any
) {
  Election
    .findOne({ mina_contract_id })
    .then((election: types.ElectionBackendData) => {
      if (!election)
        return callback('document_not_found');

      ResultProof.createOrFindResultProofByMinaContractId({
        mina_contract_id: election.mina_contract_id
      }, (err, proof) => {
        if (err || !proof)
          return callback(err || 'unknown_error');

        return callback(null, proof);
      });
    })
    .catch((err: any) => {
      console.log(err);
      return callback('database_error')
    });
};

ElectionSchema.statics.findElectionByContractIdAndAddVote = function (
  data: {
    mina_contract_id: string,
    proof: JsonProof,
    new_voter: {
      vote: number;
      nullifier: string;
    }
  },
  callback: ( error: string | null ) => any
) {
  Election
    .findOne({ mina_contract_id: data.mina_contract_id })
    .then((election: types.ElectionBackendData) => {
      if (!election)
        return callback('document_not_found');

      Election
        .findOneAndUpdate({ mina_contract_id: data.mina_contract_id }, {$set: {
          result: election.result.map((count, index) => index == data.new_voter.vote - 1 ? count + 1 : count)
        }}, { new: true })
        .then((election: types.ElectionBackendData) => {
          ResultProof.findResultProofByMinaContractIdAndUpdate({
            mina_contract_id: election.mina_contract_id,
            proof: data.proof,
            new_voter: data.new_voter
          }, (error) => {
            if (error)
              return callback(error);

            return callback(null);
          });
        })
        .catch((err: any) => {
          console.log(err)
          return callback('database_error');
        });
    })
    .catch((_err: any) => callback('database_error'));
};

ElectionSchema.statics.findElectionByContractIdAndGetResults = function (
  mina_contract_id: string,
  callback: (
    error: string | null,
    data?: {
      result: {
        name: string,
        percentage: number,
        voteCount: string,
      }[],
      proof: string
    }
  ) => any
) {
  Election
    .findOne({ mina_contract_id })
    .then((election: types.ElectionBackendData) => {
      if (!election)
        return callback('document_not_found');

      ResultProof.createOrFindResultProofByMinaContractId({
        mina_contract_id: election.mina_contract_id
      }, (error, proof) => {
        if (error || !proof)
          return callback(error || 'unknown_error');

        const totalVotes = election.result.reduce((acc, curr) => acc + curr, 0);

        return callback(null, {
          result: election.result.map((count, index) => {
            return {
              name: election.options[index],
              percentage: Math.floor((count / totalVotes) * 10000) / 100,
              voteCount: count.toString()
            }
          }),
          proof: proof.proof
        });
      });
    })
    .catch((_err: any) => callback('database_error'));
};

const Election = model('Election', ElectionSchema) as Model<any> & ElectionStatics;

export default Election;
