import { model, Model, Schema } from 'mongoose';
import { JsonProof } from 'o1js';

import { AggregationMM as Aggregation } from 'zkvot-core';

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

type ResultProofType = {
  mina_contract_id: string;
  proof: string;
  previous_voters: {
    vote: number;
    nullifier: string;
  }[];
};

interface ResultProofStatics {
  createOrFindResultProofByMinaContractId: (
    data: { mina_contract_id: string, voters_merkle_root: string },
    callback: (
      error: string | null,
      proof?: ResultProofType
    ) => any
  ) => any;
  findResultProofByMinaContractIdAndUpdate: (
    data: {
      mina_contract_id: string;
      proof: JsonProof;
      new_voter: {
        vote: number;
        nullifier: string;
      };
    },
    callback: (
      error: string | null
    ) => any
  ) => Promise<any>;
};

const ResultProofSchema = new Schema({
  mina_contract_id: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  proof: {
    type: String,
    default: ''
  },
  previous_voters: {
    type: Array,
    default: []
  }
});

ResultProofSchema.statics.createOrFindResultProofByMinaContractId = function (
  data: { mina_contract_id: string, voters_merkle_root: string },
  callback: (
    error: string | null,
    proof?: ResultProofType
  ) => any
) {
  const { mina_contract_id, voters_merkle_root } = data;

  ResultProof.findOne({
    mina_contract_id
  })
  .then((proof: ResultProofType) => {
    if (proof)
      return callback(null, proof);

    const newResultProofData = new ResultProof({
      mina_contract_id,
      proof: ''
    });

    newResultProofData.save()
      .then((proof: ResultProofType) => callback(null, proof))
      .catch((err: any) => callback('database_error'));
  })
  .catch((err: any) => callback('database_error'));
};

ResultProofSchema.statics.findResultProofByMinaContractIdAndUpdate = async function (
  data: {
    mina_contract_id: string;
    proof: JsonProof;
    new_voter: {
      vote: number;
      nullifier: string;
    }
  },
  callback: (
    error: string | null
  ) => any
) {
  const { mina_contract_id, proof, new_voter } = data;

  try {
    await Aggregation.Proof.fromJSON(proof);

    ResultProof
      .findOneAndUpdate({ mina_contract_id }, {
        $set: { proof: JSON.stringify(proof) },
        $push: { previous_voters: new_voter }
      })
      .then(() => callback(null))
      .catch((error: any) => {
        console.log('Error updating proof', error);
        return callback('database_error');
      })
  } catch (error) {
    console.log('Error parsing proofs', error);
    return callback('proof_parse_error');
  };
};

const ResultProof = model('ResultProof', ResultProofSchema) as Model<any> & ResultProofStatics;
export default ResultProof;