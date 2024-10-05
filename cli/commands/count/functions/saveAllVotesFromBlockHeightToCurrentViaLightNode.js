import async from 'async';
import { verify } from 'o1js';

import { Vote, VoteProof } from '../../../../contracts/src/VoteProgram.js';

import Avail from '../../../da-layers/avail/Avail.js';
// import Celestia from '../../../da-layers/celestia/Celestia.js';

import decodeFromBase64String from '../../../utils/decodeFromBase64String.js';
import isBase64String from '../../../utils/isBase64String.js';
import logger from '../../../utils/logger.js';

const DA_LAYERS = [ 'avail', 'celestia' ];

// 823552, 823559, 823568

const compileVoteProgramAndGetVerificationKey = callback => {
  Vote.compile()
    .then(program => callback(null, program.verificationKey))
    .catch(err => {
      logger.log('error', err);

      return callback('invalid_vote_program');
    });
};

const verifyVoteProofAndGetNullifier = (verificationKey, voteProof, callback) => {
  if (!verificationKey || typeof verificationKey != 'string' || !verificationKey.trim().length)
    return callback('bad_request');

  if (!voteProof || typeof voteProof != 'object')
    return callback('bad_request');

  VoteProof.fromJSON(voteProof)
    .then(voteProof => verify(voteProof, verificationKey))
    .then(isVerified => {
      if (!isVerified)
        return callback('invalid_vote_proof');

      return callback(null, voteProof.publicOutput.nullifier.toString());
    })
    .catch(err => {
      logger.log('error', err);

      return callback('invalid_vote_proof');
    });
};

const getAndVerifyVotesFromAvailByBlockHeight = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.electionId || typeof data.electionId != 'string' || !data.electionId.trim().length)
    return callback('bad_request');

  if (!data.blockHeight || isNaN(data.blockHeight) || Number(data.blockHeight) < 0)
    return callback('bad_request');

  if (!data.verificationKey || typeof data.verificationKey != 'string' || !data.verificationKey.trim().length)
    return callback('bad_request');

  Avail.getData({
    block_height: data.blockHeight
  }, (err, blockData) => {
    if (err && err === 'block_not_found')
      return callback(null);

    if (err)
      return callback(err);

    async.filter(
      blockData.data_transactions,
      (dataTransaction, next) => {
        if (!dataTransaction || typeof dataTransaction != 'object')
          return next(null);

        if (!isBase64String(dataTransaction.data))
          return next(null);

        decodeFromBase64String(dataTransaction.data, (err, decodedData) => {
          if (err)
            return next(null);

          verifyVoteProofAndGetNullifier(data.verificationKey, decodedData, (err, nullifier) => {
            if (err)
              return next(null);

            return next(null, {
              nullifier: nullifier,
              vote_proof: decodedData
            });
          });
        });
      },
      (err, votes) => {
        if (err)
          return callback(err);

        db.put(`${electionId}:avail_last_read_block_height`, data.blockHeight, err => {
          if (err) {
            logger.log('error', err);

            return callback(err);
          };

          async.each(
            votes,
            (vote, next) => {
              if (!vote || typeof vote != 'object')
                return next(null);

              db.put(`${electionId}:${vote.nullifier}`, vote.vote_proof, err => {
                if (err) {
                  logger.log('error', err);

                  return next(err);
                };

                return next(null);
              });
            }, err => {
              if (err) {
                logger.log('error', err);

                return callback(err);
              };

              return getAndVerifyVotesFromAvailByBlockHeight(data.blockHeight + 1, data.verificationKey, callback);
            });
          }
        );
      }
    );
  });
};

const readAvailBlocksFromStartBlockHeightToCurrent = (election, verificationKey, callback) => {
  if (!election || typeof election != 'object')
    return callback('bad_request');

  if (!election.election_id || typeof election.election_id != 'string' || !election.election_id.trim().length)
    return callback('bad_request');

  if (!election.da_layers || !Array.isArray(election.da_layers))
    return callback('bad_request');

  if (!verificationKey || typeof verificationKey != 'string' || !verificationKey.trim().length)
    return callback('bad_request');

  const availInfo = election.da_layers.find(item => typeof item === 'object' && item.name === 'avail');

  if (!availInfo)
    return callback(null);

  if (!availInfo.start_block_height || isNaN(availInfo.start_block_height) || Number(availInfo.start_block_height) < 0)
    return callback('bad_request');

  logger.log('info', 'Reading Avail blocks...');

  getAndVerifyVotesFromAvailByBlockHeight({
    electionId: election.election_id,
    blockHeight: availInfo.start_block_height,
    verificationKey: verificationKey
  }, err => {
    if (err)
      return callback(err);

    logger.log('info', 'Read Avail blocks.');

    return callback(null);
  });
};
export default (election, callback) => {
  if (!election || typeof election != 'object')
    return callback('bad_request');

  for (const layer of election.da_layers)
    if (!layer || typeof layer != 'object' || !DA_LAYERS.includes(layer.name))
      return callback('bad_request');

  compileVoteProgramAndGetVerificationKey((err, verificationKey) => {
    if (err)
      return callback(err);

    readAvailBlocksFromStartBlockHeightToCurrent(election, verificationKey, err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  });
};