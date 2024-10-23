import { Request, Response } from 'express';
import { Mina, PublicKey, PrivateKey } from 'o1js';
import { setElectionContractConstants, ElectionContract } from 'contracts';

import generateMerkleRootFromVotersList from '../../../utils/generateMerkleRootFromVotersList.js';
import { compileElectionContract, isElectionContractCompiled, isRangeAggregationCompiled } from '../../../utils/compileZkPrograms.js';

const MINA_MAINNET_NODE_GRAPHQL = 'https://api.minascan.io/node/mainnet/v1/graphql';
const MINA_MAINNET_ARCHIVE_GRAPHQL = 'https://api.minascan.io/archive/mainnet/v1/graphql';

export default async (req: Request, res: Response): Promise<any> => {
  let deployerAccount;
  try {
    deployerAccount = PublicKey.fromJSON(req.body.deployerAccount);
  } catch (error) {
    return res.json({ success: false, error: 'bad_request' });
  };

  if (!deployerAccount || !(deployerAccount instanceof PublicKey))
    return res.json({ success: false, error: 'bad_request' });

  if (!req.body.electionStartHeight || typeof req.body.electionStartHeight !== 'number')
    return res.json({ success: false, error: 'bad_request' });

  if (!req.body.electionFinalizeHeight || typeof req.body.electionFinalizeHeight !== 'number')
    return res.json({ success: false, error: 'bad_request' });

  if (!req.body.votersList || !Array.isArray(req.body.votersList))
    return res.json({ success: false, error: 'bad_request' });

  for (const voter of req.body.votersList)
    if (!voter || typeof voter !== 'string')
      return res.json({ success: false, error: 'bad_request' });

  setElectionContractConstants({
    electionStartHeight: req.body.electionStartHeight,
    electionFinalizeHeight: req.body.electionFinalizeHeight,
    votersRoot: generateMerkleRootFromVotersList(req.body.votersList)
  });

  if (!isRangeAggregationCompiled())
    return res.json({ success: false, error: 'not_compiled_yet' });

  if (!isElectionContractCompiled()) {
    try {
      await compileElectionContract();
    } catch (error) {
      console.error(error);
      return res.json({ success: false, error: 'compilation_error' });
    };
  };

  Mina.setActiveInstance(Mina.Network({
    mina: MINA_MAINNET_NODE_GRAPHQL,
    archive: MINA_MAINNET_ARCHIVE_GRAPHQL
  }));

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const zkApp = new ElectionContract(zkAppAddress);

  Mina.transaction(req.body.deployerAccount, zkApp.deploy)
    .then(async txn => {
      await txn.prove();

      txn.sign([zkAppPrivateKey]);

      return res.json({
        success: true,
        data: {
          address: zkAppAddress.toJSON(),
          txn: txn.toJSON()
        }
      });
    })
    .catch((error) => {
      console.log('Error deploying zkApp:', error);
    });
};

// const { hash } = await (window as any).mina.sendTransaction({
//   transaction: transactionJSON,
//   feePayer: {
//       fee: transactionFee,
//       memo: '',
//   },
// });
// setIsReady(true);

// const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
