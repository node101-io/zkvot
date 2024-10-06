import async from 'async';
import { verify } from 'o1js';

import { Vote, VoteProof } from '../../../../contracts/build/src/VoteProgram.js';

import Avail from '../../../da-layers/avail/Avail.js';
// import Celestia from '../../../da-layers/celestia/Celestia.js';

import db from '../../../utils/db.js';
import decodeFromBase64String from '../../../utils/decodeFromBase64String.js';
import isBase64String from '../../../utils/isBase64String.js';
import logger from '../../../utils/logger.js';

const DA_LAYERS = [ 'avail', 'celestia' ];

// 824323, 824324

const compileVoteProgramAndGetVerificationKey = callback => {
  Vote.compile()
    .then(program => callback(null, program.verificationKey))
    .catch(err => {
      logger.log('error', err);

      return callback('invalid_vote_program');
    });
};

const verifyVoteProofAndGetNullifier = (voteProof, verificationKey, callback) => {
  if (!voteProof || typeof voteProof != 'object')
    return callback('bad_request');

  if (!verificationKey || typeof verificationKey != 'object')
    return callback('bad_request');

  VoteProof.fromJSON(voteProof)
    // .then(voteProof => callback(null, voteProof.publicOutput.nullifier.toString()))
    // .catch(err => {
    //   logger.log('error', err);

    //   return callback('invalid_vote_proof');
    // });
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

  if (!data.verificationKey || typeof data.verificationKey != 'object')
    return callback('bad_request');

  Avail.getData({
    block_height: data.blockHeight
  }, (err, blockData) => {
    if (err && err === 'not_found')
      return callback(null);

    if (err)
      return callback(err);

    async.map(
      blockData.data_transactions,
      (dataTransaction, next) => {
        if (!dataTransaction || typeof dataTransaction != 'object')
          return next(null);

        decodeFromBase64String(dataTransaction.data, (err, decodedData) => {
          if (err)
            return next(null);

          verifyVoteProofAndGetNullifier(decodedData, data.verificationKey, (err, nullifier) => {
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

        async.each(
          votes,
          (vote, next) => {
            if (!vote || typeof vote != 'object')
              return next(null);

            db.put(`${data.electionId}:${vote.nullifier}`, vote.vote_proof, err => {
              if (err)
                return next(err);

              logger.log('info', `${data.electionId}:${vote.nullifier}`);

              return next(null);
            });
          },
          err => {
            if (err)
              return callback(err);

            return getAndVerifyVotesFromAvailByBlockHeight({
              electionId: data.electionId,
              blockHeight: Number(data.blockHeight) + 1,
              verificationKey: data.verificationKey
            }, callback);
          }
        );
      }
    );

    // async.filter(
    //   blockData.data_transactions,
    //   (dataTransaction, next) => {
    //     if (!dataTransaction || typeof dataTransaction != 'object')
    //       return next(null, false);

    //     decodeFromBase64String(dataTransaction.data, (err, decodedData) => {
    //       if (err)
    //         return next(null, false);

    //       getVoteProofFromDecodedData(decodedData, (err, voteProof) => {
    //         if (err)
    //           return next(null, false);

    //         return next(null, true);

    //         // isVoteProofVerified(data.verificationKey, voteProof, (err, isVerified) => {
    //         //   if (err)
    //         //     return next(null, false);

    //         //   return next(null, isVerified);
    //         // });
    //       });
    //     });
    //   },
    //   (err, votes) => {
    //     if (err)
    //       return callback(err);

    //     async.each(
    //       votes,
    //       (vote, next) => {
    //         if (!vote || typeof vote != 'object')
    //           return next(null);

    //         decodeFromBase64String(vote.data, (err, decodedData) => {
    //           if (err)
    //             return next(null);

    //           getVoteProofFromDecodedData(decodedData, (err, voteProof) => {
    //             if (err)
    //               return next(null);

    //             fetchVoteProofNullifier(voteProof, (err, nullifier) => {
    //               if (err)
    //                 return next(null);

    //               db.put(`${data.electionId}:${nullifier}`, decodedData, err => {
    //                 if (err)
    //                   return next(err);

    //                 console.log(1, `${data.electionId}:${nullifier}`);

    //                 db.get(`${data.electionId}:${nullifier}`, (err, value) => {
    //                   if (err)
    //                     return next(err);

    //                   logger.log('info', value);

    //                   return next(null);
    //                 });
    //               });
    //             });
    //           });
    //         });
    //       },
    //       err => {
    //         if (err)
    //           return callback(err);

    //         return getAndVerifyVotesFromAvailByBlockHeight({
    //           electionId: data.electionId,
    //           blockHeight: Number(data.blockHeight) + 1,
    //           verificationKey: data.verificationKey
    //         }, callback);
    //       }
    //     );
    //   }
    // );
  });
};

const readAvailBlocksFromStartBlockHeightToCurrent = (election, verificationKey, callback) => {
  if (!election || typeof election != 'object')
    return callback('bad_request');

  if (!election.election_id || typeof election.election_id != 'string' || !election.election_id.trim().length)
    return callback('bad_request');

  if (!election.da_layers || !Array.isArray(election.da_layers))
    return callback('bad_request');

  if (!verificationKey || typeof verificationKey != 'object')
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

  logger.log('info', 'Starting to save all votes from block height to current via light node...');

  compileVoteProgramAndGetVerificationKey((err, verificationKey) => {
    if (err)
      return callback(err);

    readAvailBlocksFromStartBlockHeightToCurrent(election, verificationKey, err => {
      if (err)
        return callback(err);

      db.get(`${election.election_id}:avail_last_read_block_height`, (err, blockHeight) => {
        if (err && err.code !== 'LEVEL_NOT_FOUND')
          return callback(err);

        logger.log('info', `Last read block height: ${blockHeight}`);

        return callback(null);
      });
    });
  });
};