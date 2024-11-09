import fs from 'fs';
import path from 'path';
import { Mina, PublicKey, PrivateKey } from 'o1js';

import {
  AggregateProof,
  ElectionContract,
  RangeAggregationProgram,
  setElectionContractConstants,
  Vote,
} from 'zkvot-contracts';

import logger from '../../../utils/logger.js';
import { Level } from 'level';

const db = new Level('./cachedProofsDb', { valueEncoding: 'json' });

const ADD_MINA_PRIVATE_KEY_TO_WALLET_CONFIG_COMMAND =
  'zkvot config wallet <private_key>';

const minaPrivateKeyBase58FolderPath = path.join(
  import.meta.dirname,
  '../../../../config'
);
const minaPrivateKeyBase58FilePath = path.join(
  minaPrivateKeyBase58FolderPath,
  'wallet.json'
);

const setActiveMinaInstanceToDevnet = () => {
  const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
  });

  Mina.setActiveInstance(Network);
};

const createMinaWalletConfigFolderIfNotExists = (
  minaPrivateKeyBase58FolderPath: string,
  callback: (err: Error | string | null) => void
) => {
  fs.access(minaPrivateKeyBase58FolderPath, fs.constants.F_OK, (err) => {
    if (err && err.code === 'ENOENT')
      return fs.mkdir(minaPrivateKeyBase58FolderPath, (err) => {
        if (err) return callback(err as Error | string | null);

        return callback(null);
      });

    if (err) return callback(err);

    return callback(null);
  });
};

const createMinaWalletConfigFileIfNotExists = (
  minaPrivateKeyBase58FilePath: string,
  callback: (err: Error | string | null) => void
) => {
  fs.access(minaPrivateKeyBase58FilePath, fs.constants.F_OK, (err) => {
    if (err && err.code === 'ENOENT')
      return fs.writeFile(minaPrivateKeyBase58FilePath, '', 'utf8', (err) => {
        if (err) return callback(err);

        return callback(null);
      });

    if (err) return callback(err);

    return callback(null);
  });
};

const checkIfMinaPrivateKeyBase58ExistsInWalletConfig = (
  minaPrivateKeyBase58FilePath: string,
  callback: (err: Error | string | null, exists?: boolean) => void
) => {
  fs.readFile(minaPrivateKeyBase58FilePath, 'utf8', (err, data) => {
    if (err) return callback(null, false);

    if (!data) return callback(null, false);

    try {
      const privKeyBase58Json = JSON.parse(data);

      if (!privKeyBase58Json.priv_key_base58) return callback(null, false);

      return callback(null, true);
    } catch (err) {
      return callback(null, false);
    }
  });
};

const readWalletConfigAndGetMinaPrivateKey = (
  minaPrivateKeyBase58Path: string,
  callback: (err: Error | string | null, minaPrivateKey?: PrivateKey) => void
) => {
  fs.readFile(minaPrivateKeyBase58Path, 'utf8', (err, data) => {
    if (err && err.code === 'ENOENT') return callback('file_not_found');

    if (err) return callback(err);

    try {
      const privKeyBase58Json = JSON.parse(data);

      return callback(
        null,
        PrivateKey.fromBase58(privKeyBase58Json.priv_key_base58)
      );
    } catch (err) {
      return callback('parse_error');
    }
  });
};

const getMinaPublicKeyByPrivateKey = (
  minaPrivateKey: PrivateKey,
  callback: (err: Error | string | null, minaPublicKey?: PublicKey) => void
) => {
  try {
    return callback(null, minaPrivateKey.toPublicKey());
  } catch (err) {
    return callback('public_key_error');
  }
};

const settleAggregatedElectionResultToMinaById = async (
  data: {
    electionConstants: {
      electionStartTimestamp: number;
      electionFinalizeTimestamp: number;
      votersRoot: bigint;
    };
    aggregatorPrivateKey: PrivateKey;
    electionId: PublicKey;
  },
  callback: (
    err: Error | string | null | unknown,
    transaction_hash?: string
  ) => void
) => {
  let aggregateProof;
  try {
    const aggregateProofString = await db.get(
      `${data.electionId.toBase58()}.aggregateProof`
    );
    aggregateProof = await AggregateProof.fromJSON(
      JSON.parse(aggregateProofString)
    );
  } catch (err) {
    return callback('result_not_found');
  }

  const electionContractPublicKey = data.electionId;

  setElectionContractConstants(data.electionConstants);
  const electionContract = new ElectionContract(electionContractPublicKey);

  try {
    await Vote.compile();
    await RangeAggregationProgram.compile();
    await ElectionContract.compile();

    await Mina.transaction(
      {
        sender: data.aggregatorPrivateKey.toPublicKey(),
        fee: 1e9,
      },
      async () => {
        electionContract.settleVotes(
          aggregateProof,
          data.aggregatorPrivateKey.toPublicKey()
        );
      }
    ).then(async (txn) => {
      txn.sign([data.aggregatorPrivateKey]);
      await txn.prove();

      return callback(null, txn.toJSON());
    });
  } catch (err) {
    return callback(err);
  }
};

readWalletConfigAndGetMinaPrivateKey(
  minaPrivateKeyBase58FilePath,
  (err, minaPrivateKey) => {
    if (err) return logger.log('error', err);

    if (!minaPrivateKey) return logger.log('error', 'priv_key_not_found');

    getMinaPublicKeyByPrivateKey(minaPrivateKey, (err, minaPublicKey) => {
      if (err) return logger.log('error', err);

      if (!minaPublicKey) return logger.log('error', 'pub_key_not_found');

      setActiveMinaInstanceToDevnet();

      settleAggregatedElectionResultToMinaById(
        {
          electionConstants: {
            electionStartTimestamp: 0,
            electionFinalizeTimestamp: 0,
            votersRoot: BigInt(0),
          },
          aggregatorPrivateKey: minaPrivateKey,
          electionId: PublicKey.fromBase58(
            'B62qkdfkUfGoz6bXrupHhnyE5e6NQJLDKXvWQaWVNDFKV92TUDw1zg6'
          ),
        },
        (err, transaction_hash) => {
          if (err) return logger.log('error', err);

          logger.log('info', `Transaction hash: ${transaction_hash}`);
        }
      );
    });
  }
);

const settleCheck = (
  callback: (err: Error | string | null, transaction_hash?: string) => void
) => {
  createMinaWalletConfigFolderIfNotExists(
    minaPrivateKeyBase58FolderPath,
    (err) => {
      if (err) return callback(err);

      createMinaWalletConfigFileIfNotExists(
        minaPrivateKeyBase58FilePath,
        (err) => {
          if (err) return callback(err);

          checkIfMinaPrivateKeyBase58ExistsInWalletConfig(
            minaPrivateKeyBase58FilePath,
            (err, exists) => {
              if (err) return callback(err);

              if (!exists) {
                logger.log(
                  'warn',
                  `Please add your Mina private key to the wallet config: ${ADD_MINA_PRIVATE_KEY_TO_WALLET_CONFIG_COMMAND}`
                );

                return callback('priv_key_not_found');
              }

              readWalletConfigAndGetMinaPrivateKey(
                minaPrivateKeyBase58FilePath,
                (err, minaPrivateKey) => {
                  if (err) return callback(err);

                  if (!minaPrivateKey) return callback('priv_key_not_found');

                  getMinaPublicKeyByPrivateKey(
                    minaPrivateKey,
                    (err, minaPublicKey) => {
                      if (err) return callback(err);

                      if (!minaPublicKey) return callback('pub_key_not_found');

                      logger.log(
                        'info',
                        `Mina private key: ${minaPrivateKey.toJSON()}`
                      );
                      logger.log(
                        'info',
                        `Mina public key: ${minaPublicKey.toJSON()}`
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
