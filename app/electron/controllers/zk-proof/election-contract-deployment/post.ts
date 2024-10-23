import { Request, Response } from 'express';
import { Mina, PublicKey, PrivateKey } from 'o1js';
// import { ElectionContract } from 'contracts';

import { isElectionContractCompiled } from '../../../utils/compileZkPrograms.js';

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

  if (!isElectionContractCompiled())
    return res.json({ success: false, error: 'not_compiled_yet' });

  const Network = Mina.Network({
    mina: MINA_MAINNET_NODE_GRAPHQL,
    archive: MINA_MAINNET_ARCHIVE_GRAPHQL
  });

  Mina.setActiveInstance(Network);

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const { setElectionContractConstants, ElectionContract } = await import('contracts');

  // TODO: check if setting constants is working
  setElectionContractConstants({
    electionStartHeight: 123,
    electionFinalizeHeight: 12412,
    votersRoot: "9980342968624030084106297645024923555286525192527553920497338717791905606678"
  });

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
