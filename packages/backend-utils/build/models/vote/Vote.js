import { model, Schema } from 'mongoose';
import aggregate from '../../utils/aggregate.js';
import isBase64String from '../../utils/isBase64String.js';
import decodeFromBase64String from '../../utils/decodeFromBase64String.js';
import Election from '../election/Election.js';
import verifyVote from './functions/verifyVote.js';
import submitVote from './functions/submitVote.js';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const RESTART_VOTE_COUNTING_INTERVAL = 5 * 1000;
;
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
    proof: {
        type: String,
        default: ''
    },
    is_counted: {
        type: Boolean,
        default: false
    }
});
VoteSchema.statics.createVote = function (data, callback) {
    if (!isBase64String(data.da_layer_submission_data.proof))
        return callback('bad_request');
    Election.findOrCreateElectionByContractId({
        mina_contract_id: data.da_layer_submission_data.election_id,
        is_devnet: data.is_devnet
    }, (err, election) => {
        if (err || !election)
            return callback(err || 'unknown_error');
        if (!election.communication_layers.find(layer => layer.name == data.da_layer))
            return callback('bad_request');
        decodeFromBase64String(data.da_layer_submission_data.proof, (err, jsonProof) => {
            if (err || !jsonProof)
                return callback(err);
            verifyVote({
                vote: jsonProof,
                electionPubKey: election.mina_contract_id,
                merkleRoot: election.voters_merkle_root
            }, (err, voteOutput) => {
                if (err || !voteOutput)
                    return callback(err || 'unknown_error');
                const vote = new Vote({
                    election_contract_id: data.da_layer_submission_data.election_id,
                    nullifier: voteOutput.nullifier,
                    vote: voteOutput.vote,
                    da_layer: data.da_layer,
                    proof: JSON.stringify(jsonProof),
                    is_counted: false
                });
                vote
                    .save()
                    .then((vote) => callback(null, vote))
                    .catch((err) => {
                    if (err.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                        return callback('duplicated_unique_field');
                    return callback('bad_request');
                });
            });
        });
    });
};
VoteSchema.statics.createAndSubmitVote = function (data, callback) {
    if (!isBase64String(data.da_layer_submission_data.proof))
        return callback('bad_request');
    Election.findOrCreateElectionByContractId({
        mina_contract_id: data.da_layer_submission_data.election_id,
        is_devnet: data.is_devnet
    }, (err, election) => {
        if (err || !election)
            return callback(err || 'unknown_error');
        if (!election.communication_layers.find(layer => layer.name == data.da_layer))
            return callback('bad_request');
        decodeFromBase64String(data.da_layer_submission_data.proof, (err, jsonProof) => {
            if (err || !jsonProof)
                return callback(err);
            verifyVote({
                vote: jsonProof,
                electionPubKey: election.mina_contract_id,
                merkleRoot: election.voters_merkle_root
            }, (err, voteOutput) => {
                if (err || !voteOutput)
                    return callback(err || 'unknown_error');
                const submitVoteData = {
                    submission_data: data.da_layer_submission_data,
                    da_layer: data.da_layer
                };
                if (data.da_layer == 'Avail')
                    submitVoteData.app_id = election.communication_layers.find(layer => layer.name == data.da_layer)?.app_id;
                else if (data.da_layer == 'Celestia')
                    submitVoteData.namespace = election.communication_layers.find(layer => layer.name == data.da_layer)?.namespace;
                else
                    return callback('not_possible_error');
                submitVote(submitVoteData, data.is_devnet, (err, result) => {
                    if (err)
                        return callback(err);
                    const vote = new Vote({
                        election_contract_id: data.da_layer_submission_data.election_id,
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
                        .then((vote) => callback(null, vote))
                        .catch((err) => {
                        if (err.code === DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                            return callback('duplicated_unique_field');
                        return callback('bad_request');
                    });
                });
            });
        });
    });
};
VoteSchema.statics.countOldestUncountedVote = function (callback) {
    Vote
        .findOne({ is_counted: false })
        .sort({ _id: 1 })
        .then((vote) => {
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
                }, (err, proof) => {
                    if (err)
                        return callback(err);
                    Election.findElectionByContractIdAndAddVote({
                        mina_contract_id: vote.election_contract_id,
                        proof,
                        new_voter: {
                            vote: vote.vote,
                            nullifier: vote.nullifier
                        }
                    }, err => {
                        if (err)
                            return callback(err);
                        Vote
                            .findOneAndUpdate({ nullifier: vote.nullifier }, { $set: {
                                proof: '',
                                is_counted: true
                            } })
                            .then(() => callback(null))
                            .catch((err) => {
                            console.log(err);
                            return callback('database_error');
                        });
                    });
                });
            }
            else {
                aggregate({
                    proof_json: vote.proof
                }, (err, proof) => {
                    if (err)
                        return callback(err);
                    Election.findElectionByContractIdAndAddVote({
                        mina_contract_id: vote.election_contract_id,
                        proof,
                        new_voter: {
                            vote: vote.vote,
                            nullifier: vote.nullifier
                        }
                    }, err => {
                        if (err)
                            return callback(err);
                        Vote
                            .findOneAndUpdate({ nullifier: vote.nullifier }, { $set: {
                                proof: '',
                                is_counted: true
                            } })
                            .then(() => callback(null))
                            .catch((err) => {
                            console.log(err);
                            return callback('database_error');
                        });
                    });
                });
            }
        });
    })
        .catch((_err) => callback('database_error'));
};
VoteSchema.statics.countVotesRecursively = function () {
    Vote.countOldestUncountedVote(err => {
        if (err) {
            console.error(err);
            return setTimeout(Vote.countVotesRecursively, RESTART_VOTE_COUNTING_INTERVAL);
        }
        ;
        return Vote.countVotesRecursively();
    });
};
const Vote = model('Vote', VoteSchema);
export default Vote;
//# sourceMappingURL=Vote.js.map