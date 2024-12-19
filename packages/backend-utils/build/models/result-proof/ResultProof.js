import { model, Schema } from 'mongoose';
import { AggregationMM as Aggregation } from 'zkvot-core';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
;
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
ResultProofSchema.statics.createOrFindResultProofByMinaContractId = function (data, callback) {
    const { mina_contract_id } = data;
    ResultProof.findOne({
        mina_contract_id
    })
        .then((proof) => {
        if (proof)
            return callback(null, proof);
        const newResultProofData = new ResultProof({
            mina_contract_id,
            proof: ''
        });
        newResultProofData.save()
            .then((proof) => callback(null, proof))
            .catch((err) => callback('database_error'));
    })
        .catch((err) => {
        console.log(err);
        return callback('database_error');
    });
};
ResultProofSchema.statics.findResultProofByMinaContractIdAndUpdate = async function (data, callback) {
    const { mina_contract_id, proof, new_voter } = data;
    try {
        await Aggregation.Proof.fromJSON(proof);
        ResultProof
            .findOneAndUpdate({ mina_contract_id }, {
            $set: { proof: JSON.stringify(proof) },
            $push: { previous_voters: new_voter }
        })
            .then(() => callback(null))
            .catch((error) => {
            console.log('Error updating proof', error);
            return callback('database_error');
        });
    }
    catch (error) {
        console.log('Error parsing proofs', error);
        return callback('proof_parse_error');
    }
    ;
};
const ResultProof = model('ResultProof', ResultProofSchema);
export default ResultProof;
//# sourceMappingURL=ResultProof.js.map