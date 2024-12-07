import async from 'async';
import { JsonProof, VerificationKey, verify } from 'o1js';

import { Vote, types } from 'zkvot-core';

import Avail from '../../../da-layers/avail/Avail.js';
import Celestia from '../../../da-layers/celestia/Celestia.js';

import db from '../../../utils/db.js';
import decodeFromBase64String from '../../../utils/decodeFromBase64String.js';
import isBase64String from '../../../utils/isBase64String.js';
import logger from '../../../utils/logger.js';

const compileVoteProgramAndGetVerificationKey = (callback: (err: Error | string | null, verificationKey?: VerificationKey) => void) => {
  Vote.Program.compile()
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
  Vote.Proof.fromJSON(jsonVoteProof)
    .then(voteProof => {
      verify(voteProof, verificationKey)
        .then(isVerified => {
          if (!isVerified)
            return callback('invalid_vote_proof');

          return callback(null, voteProof.publicOutput.nullifier.toString());
        })
        .catch(err => {
          return callback('invalid_vote_proof');
        });
    })
    .catch(err => {
      return callback('invalid_vote_proof');
    });
};

const checkEachVoteAndReturnWithNullifier = (
  blockData: (types.CelestiaDataTx | types.AvailDataTx)[],
  verificationKey: VerificationKey,
  callback: (err: string | null, vote?: { nullifier: string, vote_proof: JsonProof }[]) => void
) => {
  async.mapSeries(
    blockData,
    (
      dataTx: types.CelestiaDataTx | types.AvailDataTx,
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

const writeVoteToDBSublevelByElectionId = (
  data: {
    electionSublevel: any,
    nullifier: string,
    voteProof: JsonProof
  },
  callback: (err: Error | string | null) => void
) => {
  data.electionSublevel
    .put(data.nullifier, data.voteProof, {}, (err: Error | null) => {
      if (err)
        return callback(err);

      return callback(null);
    });
};

const saveVerifiedVotesToDB = (
  votes: { nullifier: string, vote_proof: JsonProof }[],
  electionId: string,
  callback: (err: Error | string | null) => void
) => {
  const electionSublevel = db.sublevel(electionId, { valueEncoding: 'json' });

  async.each(
    votes,
    (
      vote: { nullifier: string, vote_proof: JsonProof },
      next: (err: Error | string | null) => void
    ) => {
      writeVoteToDBSublevelByElectionId({
        electionSublevel: electionSublevel,
        nullifier: vote.nullifier,
        voteProof: vote.vote_proof
      }, err => {
        if (err)
          return next(err);

        logger.log('info', `Vote saved to DB under the sublevel: ${electionId}`);

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

const getAndVerifyVotesFromAvailByBlockHeightRecursively = (
  data: {
    electionId: string,
    blockHeight: number,
    verificationKey: VerificationKey
  },
  callback: (err: Error | string | null | undefined) => void
) => {
  logger.log('info', `Reading block: ${data.blockHeight}`);

  Avail.getData({ block_height: data.blockHeight }, (err, blockData) => {
    if (err || !blockData) {
      logger.log('info', `Block ${data.blockHeight} is not found, stopping fetching votes from Avail.`);
      return callback(null);
    }

    logger.log('info', 'Getting and verifying votes from Avail by block height...');

    checkEachVoteAndReturnWithNullifier(blockData, data.verificationKey, (err, votes) => {
      if (err || !votes)
        return callback(err);

      logger.log('info', `Got and verified ${votes.length} votes from Avail by block height.`);

      saveVerifiedVotesToDB(votes, data.electionId, err => {
        if (err)
          return callback(err);

        return getAndVerifyVotesFromAvailByBlockHeightRecursively({
          electionId: data.electionId,
          blockHeight: Number(data.blockHeight) + 1,
          verificationKey: data.verificationKey
        }, callback);
      });
    });
  });
};

const readAvailBlocksFromStartBlockHeightToCurrent = (
  mina_contract_id: string,
  election: types.ElectionStaticData,
  verificationKey: VerificationKey,
  callback: (err: Error | string | null) => void
) => {
  const availInfo: types.AvailDaLayerInfo | undefined = (election.communication_layers as types.AvailDaLayerInfo[]).find(daLayer => daLayer.name === 'Avail');

  if (!availInfo)
    return callback(null);

  logger.log('info', 'Reading Avail blocks from start block height to current...');

  getAndVerifyVotesFromAvailByBlockHeightRecursively({
    electionId: mina_contract_id,
    blockHeight: availInfo.start_block_height,
    verificationKey: verificationKey
  }, err => {
    if (err)
      return callback(err);

    return callback(null);
  });
};

const getAndVerifyVotesFromCelestiaByBlockHeightAndNamespaceRecursively = (
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
    if (err || !blockData) {
      logger.log('info', `Block ${data.blockHeight} is not found, stopping fetching votes from Celestia.`);
      return callback(null);
    }

    logger.log('info', 'Getting and verifying votes from Celestia by block height and namespace...');

    checkEachVoteAndReturnWithNullifier(blockData, data.verificationKey, (err, votes) => {
      if (err || !votes)
        return callback(err);

      logger.log('info', `Got and verified ${votes.length} votes from Celestia by block height and namespace.`);

      saveVerifiedVotesToDB(votes, data.electionId, err => {
        if (err)
          return callback(err);

        return getAndVerifyVotesFromCelestiaByBlockHeightAndNamespaceRecursively({
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
  mina_contract_id: string,
  election: types.ElectionStaticData,
  verificationKey: VerificationKey,
  callback: (err: Error | string | null) => void
) => {
  const celestiaInfo: types.CelestiaDaLayerInfo | undefined = (election.communication_layers as types.CelestiaDaLayerInfo[]).find(daLayer => daLayer.name === 'Celestia');

  if (!celestiaInfo)
    return callback(null);

  logger.log('info', 'Reading Celestia blocks from start block height to current...');

  getAndVerifyVotesFromCelestiaByBlockHeightAndNamespaceRecursively({
    electionId: mina_contract_id,
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
  mina_contract_id: string,
  election: types.ElectionStaticData,
  callback: (err: Error | string | null) => void
) => {
  compileVoteProgramAndGetVerificationKey((err, verificationKey) => {
    if (err || !verificationKey)
      return callback(err);

    logger.log('info', 'Compiled vote program and got verification key.');

    readAvailBlocksFromStartBlockHeightToCurrent(mina_contract_id, election, verificationKey, err => {
      if (err)
        return callback(err);

      readCelestiaBlocksFromStartBlockHeightToCurrent(mina_contract_id, election, verificationKey, err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  });
};
