import { Request, Response } from 'express';
import { ElectionContract } from 'contracts';
import { Mina, PublicKey, PrivateKey } from 'o1js';

const MINA_MAINNET_NODE_GRAPHQL = 'https://api.minascan.io/node/mainnet/v1/graphql';
const MINA_MAINNET_ARCHIVE_GRAPHQL = 'https://api.minascan.io/archive/mainnet/v1/graphql';

let isElectionCompiled = false;

ElectionContract.compile()
  .then(() => isElectionCompiled = true)
  .catch(error => {
    console.log('Error compiling Election contract:', error);
  });

export default (req: Request, res: Response): any => {
  if (!req.body.deployerAccount || !(req.body.deployerAccount instanceof PublicKey))
    return res.json({ success: false, error: 'bad_request' });

  if (!isElectionCompiled)
    return res.json({ success: false, error: 'not_compiled_yet' });

  const Network = Mina.Network({
    mina: MINA_MAINNET_NODE_GRAPHQL,
    archive: MINA_MAINNET_ARCHIVE_GRAPHQL
  });

  Mina.setActiveInstance(Network);

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
