'use client';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
/*
import { getSdk } from '@namada/sdk/web';
import sdkInit from '@namada/sdk/web-init';

import {
  BondProps,
  WrapperTxProps,
} from '@namada/sdk/dist/web/types/src/index';

import BigNumber from 'bignumber.js';

const url = 'https://rpc.example.net';
const tokenAddress = 'tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e'; // bech32m encoded NAM address
const chainId = 'namada-testnet-1';
const maspIndexerUrl = 'https://indexer.example.net';
const dbName = 'wallet';
const token = 'NAM';

const init = async (): Promise<void> => {
  const { cryptoMemory } = await sdkInit();
  const sdk = getSdk(cryptoMemory, url, maspIndexerUrl, dbName, token);

  const { keys, mnemonic, rpc, signing, tx } = sdk;

  const mnemonicPhrase = mnemonic.generate(24).join(' ');
  const seed = mnemonic.toSeed(mnemonicPhrase);

  const bip44Path = {
    account: 0,
    change: 0,
    index: 0,
  };
  const { address, publicKey, privateKey } = keys.deriveFromSeed(
    seed,
    bip44Path
  );

  // Construct a Bond transaction
  const bondProps: BondProps = {
    source: address,
    validator: 'tnam1q9vhfdur7gadtwx4r223agpal0fvlqhywylf2mzx',
    amount: BigNumber(123),
  };

  // Define Wrapper Tx props
  const wrapperTxProps: WrapperTxProps = {
    token: tokenAddress,
    feeAmount: BigNumber(1),
    gasLimit: BigNumber(1000),
    chainId: '',
    publicKey,
    memo: 'A bond transaction',
  };

  const bondTx = await tx.buildBond(wrapperTxProps, bondProps);

  const signedBondTxBytes = await signing.sign(bondTx, privateKey);

  const txResponse = await rpc.broadcastTx(signedBondTxBytes, wrapperTxProps);
};

init();
*/
interface NamadaWalletContextInterface {
  namadaWalletAddress: string;
  isNamadaWalletInstalled: boolean;
  connectNamadaWallet: () => Promise<string>;
  disconnectNamadaWallet: () => void;
}

export const NamadaWalletContext = createContext<NamadaWalletContextInterface>({
  namadaWalletAddress: '',
  isNamadaWalletInstalled: false,
  connectNamadaWallet: async () => '',
  disconnectNamadaWallet: () => {},
});

export const NamadaWalletProvider = ({ children }: PropsWithChildren<{}>) => {
  const [namadaWalletAddress, setNamadaWalletAddress] =
    useState<NamadaWalletContextInterface['namadaWalletAddress']>('');
  const [isNamadaWalletInstalled, setIsNamadaWalletInstalled] =
    useState<NamadaWalletContextInterface['isNamadaWalletInstalled']>(false);

  useEffect(() => {
    setIsNamadaWalletInstalled(!!(window as any).namada);
  }, []);

  return (
    <NamadaWalletContext.Provider
      value={{
        namadaWalletAddress,
        isNamadaWalletInstalled,
        connectNamadaWallet: async () => '',
        disconnectNamadaWallet: () => {},
      }}
    >
      {children}
    </NamadaWalletContext.Provider>
  );
};
