import { Request, Response } from 'express';
import { ElectionContract } from 'contracts';
import { Mina, PublicKey, PrivateKey } from 'o1js';

const MINA_MAINNET_NODE_GRAPHQL = 'https://api.minascan.io/node/mainnet/v1/graphql';
const MINA_MAINNET_ARCHIVE_GRAPHQL = 'https://api.minascan.io/archive/mainnet/v1/graphql';

export default async (req: Request, res: Response) => {
  if (!req.body.deployerAccount || !(req.body.deployerAccount instanceof PublicKey))
    return res.json({ success: false, error: 'bad_request' });

  const deployerAccount = req.body.deployerAccount;

  const Network = Mina.Network({
    mina: MINA_MAINNET_NODE_GRAPHQL,
    archive: MINA_MAINNET_ARCHIVE_GRAPHQL
  });
  Mina.setActiveInstance(Network);

  await ElectionContract.compile();

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  const zkApp = new ElectionContract(zkAppAddress);

  const txn = await Mina.transaction(deployerAccount, async () => {
    zkApp.deploy();
  });
  await txn.prove();

  txn.sign([zkAppPrivateKey]);

  return res.json({
    success: true,
    data: {
      address: zkAppAddress.toJSON(),
      txn: txn.toJSON()
    }
  });

  // const { hash } = await (window as any).mina.sendTransaction({
  //   transaction: transactionJSON,
  //   feePayer: {
  //       fee: transactionFee,
  //       memo: '',
  //   },
  // });
  // setIsReady(true);

  // const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
};
