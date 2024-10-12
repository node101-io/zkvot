import async from 'async';
import { JsonProof, VerificationKey, verify } from 'o1js';

import { AvailDaLayerInfo, AvailDataTx, CelestiaDaLayerInfo, CelestiaDataTx } from '../../../types/daLayers.js';
import { Election } from '../../../types/election.js';

import { Vote, VoteProof } from '../VoteProgram.js';

import Avail from '../../../da-layers/avail/Avail.js';
import Celestia from '../../../da-layers/celestia/Celestia.js';

import db from '../../../utils/db.js';
import decodeFromBase64String from '../../../utils/decodeFromBase64String.js';
import isBase64String from '../../../utils/isBase64String.js';
import logger from '../../../utils/logger.js';

const compileVoteProgramAndGetVerificationKey = (callback: (err: Error | string | null, verificationKey?: VerificationKey) => void) => {
  Vote.compile({ forceRecompile: true })
    .then(program => callback(null, program.verificationKey))
    .catch(err => {
      logger.log('error', `Failed to compile vote program: ${err}`);

      return callback('invalid_vote_program');
    });
};

const verifyVoteProofAndGetNullifier = (
  jsonVoteProof: JsonProof,
  verificationKey: VerificationKey,
  callback: (err: string | null, nullifier?: string) => void
) => {
  VoteProof.fromJSON(jsonVoteProof)
    .then(voteProof => {
      verify(voteProof, verificationKey)
        .then(isVerified => {
          if (!isVerified)
            return callback('invalid_vote_proof');

          return callback(null, voteProof.publicOutput.nullifier.toString());
        })
        .catch(err => {
          logger.log('error', `Failed to verify vote proof: ${err}`);

          return callback('invalid_vote_proof');
        });
    })
    .catch(err => {
      logger.log('error', `Failed to parse vote proof: ${err}`);

      return callback('invalid_vote_proof');
    });
};

const checkEachVoteAndReturnWithNullifier = (
  blockData: (CelestiaDataTx | AvailDataTx)[],
  verificationKey: VerificationKey,
  callback: (err: string | null, vote?: { nullifier: string, vote_proof: JsonProof }[]) => void
) => {
  async.mapSeries(
    blockData,
    (
      dataTx: CelestiaDataTx | AvailDataTx,
      next: (
        err: string | null,
        vote?: { nullifier: string, vote_proof: JsonProof }
      ) => void
    ) => {
      decodeFromBase64String(dataTx.data, (err, decodedData?: JsonProof) => {
        if (err || !decodedData)
          return next(null);

        verifyVoteProofAndGetNullifier(decodedData, verificationKey, (err, nullifier) => {
          if (err || !nullifier)
            return next(null);

          return next(null, {
            nullifier: nullifier,
            vote_proof: decodedData
          });
        });
      });
    },
    (
      err: string | null | undefined,
      votes: ({ nullifier: string, vote_proof: JsonProof } | undefined)[] = []
    ) => {
      if (err)
        return callback(err);

      return callback(null, votes.filter(vote => vote !== undefined) as { nullifier: string, vote_proof: JsonProof }[]);
    }
  );
};

const processVerifiedVotesAndSaveToDB = (
  votes: { nullifier: string, vote_proof: JsonProof }[],
  electionId: string,
  callback: (err: Error | string | null) => void
) => {
  async.each(
    votes,
    (
      vote: { nullifier: string, vote_proof: JsonProof },
      next: (err: Error | string | null) => void
    ) => {
      db.put(`${electionId}:${vote.nullifier}`, vote.vote_proof, err => {
        if (err)
          return next(err);

        logger.log('info', `Vote saved to DB - ${electionId}:${vote.nullifier}`);

        return next(null);
      });
    },
    err => {
      if (err)
        return callback(err);

      return callback(null);
    }
  );
};

const getAndVerifyVotesFromAvailByBlockHeight = (
  data: {
    electionId: string,
    blockHeight: number,
    verificationKey: VerificationKey
  },
  callback: (err: Error | string | null | undefined) => void
) => {
  logger.log('info', `Reading block: ${data.blockHeight}`);

  Avail.getData({ block_height: data.blockHeight }, (err, blockData) => {
    if (err || !blockData)
      return callback(err);

    logger.log('info', 'Getting and verifying votes from Avail by block height...');

    checkEachVoteAndReturnWithNullifier(blockData, data.verificationKey, (err, votes) => {
      if (err || !votes)
        return callback(err);

      logger.log('info', `Got and verified ${votes.length} votes from Avail by block height.`);

      processVerifiedVotesAndSaveToDB(votes, data.electionId, err => {
        if (err)
          return callback(err);

        return getAndVerifyVotesFromAvailByBlockHeight({
          electionId: data.electionId,
          blockHeight: Number(data.blockHeight) + 1,
          verificationKey: data.verificationKey
        }, callback);
      });
    });
  });
};

const readAvailBlocksFromStartBlockHeightToCurrent = (
  election: Election,
  verificationKey: VerificationKey,
  callback: (err: Error | string | null) => void
) => {
  const availInfo: AvailDaLayerInfo | undefined = (election.da_layers as AvailDaLayerInfo[]).find(daLayer => daLayer.name === 'avail');

  if (!availInfo)
    return callback(null);

  logger.log('info', 'Reading Avail blocks from start block height to current...');

  getAndVerifyVotesFromAvailByBlockHeight({
    electionId: election.mina_contract_id,
    blockHeight: availInfo.start_block_height,
    verificationKey: verificationKey
  }, err => {
    if (err)
      return callback(err);

    return callback(null);
  });
};

const getAndVerifyVotesFromCelestiaByBlockHeightAndNamespace = (
  data: {
    electionId: string,
    blockHeight: number,
    namespace: string,
    verificationKey: VerificationKey
  },
  callback: (err: Error | string | null | undefined) => void
) => {
  if (!isBase64String(data.namespace))
    return callback('bad_request');

  logger.log('info', `Reading block: ${data.blockHeight}`);

  Celestia.getData({
    block_height: data.blockHeight,
    namespace: data.namespace
  }, (err, blockData) => {
    if (err || !blockData)
      return callback(err);

    logger.log('info', 'Getting and verifying votes from Celestia by block height and namespace...');

    checkEachVoteAndReturnWithNullifier(blockData, data.verificationKey, (err, votes) => {
      if (err || !votes)
        return callback(err);

      logger.log('info', `Got and verified ${votes.length} votes from Celestia by block height and namespace.`);

      processVerifiedVotesAndSaveToDB(votes, data.electionId, err => {
        if (err)
          return callback(err);

        return getAndVerifyVotesFromCelestiaByBlockHeightAndNamespace({
          electionId: data.electionId,
          blockHeight: Number(data.blockHeight) + 1,
          namespace: data.namespace,
          verificationKey: data.verificationKey
        }, callback);
      });
    });
  });
};

const readCelestiaBlocksFromStartBlockHeightToCurrent = (
  election: Election,
  verificationKey: VerificationKey,
  callback: (err: Error | string | null) => void
) => {
  const celestiaInfo: CelestiaDaLayerInfo | undefined = (election.da_layers as CelestiaDaLayerInfo[]).find(daLayer => daLayer.name === 'celestia');

  if (!celestiaInfo)
    return callback(null);

  logger.log('info', 'Reading Celestia blocks from start block height to current...');

  getAndVerifyVotesFromCelestiaByBlockHeightAndNamespace({
    electionId: election.mina_contract_id,
    blockHeight: celestiaInfo.start_block_height,
    namespace: celestiaInfo.namespace,
    verificationKey: verificationKey
  }, err => {
    if (err)
      return callback(err);

    return callback(null);
  });
};

export default (
  election: Election,
  callback: (err: Error | string | null) => void
) => {
  compileVoteProgramAndGetVerificationKey((err, verificationKey) => {
    if (err || !verificationKey)
      return callback(err);

    logger.log('info', 'Compiled vote program and got verification key.');

    readAvailBlocksFromStartBlockHeightToCurrent(election, verificationKey, err => {
      if (err)
        return callback(err);

      readCelestiaBlocksFromStartBlockHeightToCurrent(election, verificationKey, err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  });
};
