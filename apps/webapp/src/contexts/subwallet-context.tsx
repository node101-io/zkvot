'use client';

import { createContext, useState, useEffect, PropsWithChildren } from 'react';
import { Buffer } from 'buffer';
import { initialize as initAvailAPI, ApiPromise } from 'avail-js-sdk';
import { KeypairType, } from '@polkadot/util-crypto/types';
import { DispatchError } from '@polkadot/types/interfaces';

type Account = {
  source: string;
  address: string;
  meta: {
      genesisHash?: string | null;
      name?: string;
      source: string;
  };
  type?: KeypairType;
};

export interface SubWalletContextInterface {
  accounts: Account[];
  subWalletAddress: string;
  api: ApiPromise | null;
  isSubmitting: boolean;
  generatedAppId: number;
  connectSubWallet: () => Promise<boolean>;
  selectAccount: (account: Account) => Promise<void>;
  disconnectSubWallet: () => void;
  sendTransactionSubwallet: (zkProofData: string) => Promise<boolean>;
  createAppId: () => Promise<{
    id: number,
    owner: string,
    name: string,
    appName: string,
  }>;
};

export const SubwalletContext = createContext<SubWalletContextInterface>({
  accounts: [],
  subWalletAddress: '',
  api: null,
  isSubmitting: false,
  generatedAppId: 0,
  connectSubWallet: async () => false,
  selectAccount: async () => {},
  disconnectSubWallet: () => {},
  sendTransactionSubwallet: async () => false,
  createAppId: async () => {return { id: 0, owner: '', name: '', appName: ''}}
});

export const SubwalletProvider = ({
  children
}: PropsWithChildren<{}>) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [subWalletAccount, setSubWalletAccount] = useState<Account | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedAppId, setGeneratedAppId] = useState<number>(0);

  useEffect(() => {
    const initializeApi = async (): Promise<void> => {
      try {
        const newApi = await initAvailAPI('wss://turing-rpc.avail.so/ws');

        setApi(newApi);
      } catch (error) {
        throw new Error('Failed to initialize API.');
      }
    };

    initializeApi();

    return () => {
      if (api && api.isConnected) {
        api.disconnect();
        console.log('API disconnected');
      }
    };
  }, []);

  const connectSubWallet = async (): Promise<boolean> => {
    try {
      const { web3Enable, web3Accounts } = await import(
        '@polkadot/extension-dapp'
      );
      const extensions = await web3Enable('Your App Name');

      if (extensions.length === 0)
        throw new Error('No extensions installed.');

      const injectedAccounts = await web3Accounts();
      const accountsWithSource = injectedAccounts.map((account) => ({
        ...account,
        source: account.meta.source,
      }));

      setAccounts(accountsWithSource);

      if (accountsWithSource.length > 0) {
        setSubWalletAccount(accountsWithSource[0]);
      }

      return true;
    } catch (error) {
      throw new Error('Failed to connect wallet.');
    }
  };

  const selectAccount = async (account: Account): Promise<void> => {
    setSubWalletAccount(account);

    if (api) {
      try {
        const { web3FromSource } = await import('@polkadot/extension-dapp');
        const injector = await web3FromSource(account.source);

        if (injector.metadata) {
          const { signedExtensions, types } = await import('avail-js-sdk');
          const metadata = getInjectorMetadata(api, signedExtensions as any, types);
          await injector.metadata.provide(metadata as any);
        }
      } catch (error) {
        throw new Error('Failed to select account.');
      }
    }
  };

  const disconnectSubWallet = () => {
    setAccounts([]);
    setSubWalletAccount(null);
  };

  const sendTransactionSubwallet = async (zkProofData: string): Promise<boolean> => {
    if (!api || !subWalletAccount)
      throw new Error ('Please connect a wallet first.');

    try {
      setIsSubmitting(true);

      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(subWalletAccount.source);
      api.setSigner(injector.signer as any);

      const encodedData = Buffer.from(JSON.stringify(zkProofData)).toString(
        'base64'
      );
      const tx = api.tx.dataAvailability.submitData(encodedData);

      const result: boolean = await new Promise((resolve) => {
        let alreadyHandled = false;

        tx.signAndSend(
          subWalletAccount.address,
          { signer: injector.signer as any },
          ({ status, events, dispatchError }) => {
            if (alreadyHandled) return;

            if (dispatchError) {
              setIsSubmitting(false);
              alreadyHandled = true;
              throw new Error(formatDispatchError(dispatchError as any));
            };

            if (status.isFinalized) {
              const successEvent = events.find(
                ({ event }) =>
                  event.section === 'dataAvailability' &&
                  event.method === 'DataSubmitted'
              );

              if (successEvent) {
                setIsSubmitting(false);
                alreadyHandled = true;
                resolve(true);
              } else {
                setIsSubmitting(false);
                alreadyHandled = true;
                resolve(false);
              }
            };
          }
        ).catch((error) => {
          setIsSubmitting(false);
          resolve(false);
        });
      });

      return result;
    } catch (error) {
      setIsSubmitting(false);
      throw new Error('Error sending transaction.');
    }
  };

  const createAppId = async (): Promise<{
    id: number,
    owner: string,
    name: string,
    appName: string,
  }> => {
    if (!api || !subWalletAccount)
      throw new Error('Please connect your wallet and select an account.');

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const appName = `zkVot - ${randomNumber}`;

    setIsSubmitting(true);

    return new Promise(async (resolve, reject) => {
      try {
        const { web3FromSource } = await import('@polkadot/extension-dapp');
        const injector = await web3FromSource(subWalletAccount.source);

        const unsub = await api.tx.dataAvailability
          .createApplicationKey(appName)
          .signAndSend(
            subWalletAccount.address,
            { signer: injector.signer as any },
            ({ status, events, dispatchError }) => {
              if (status.isInBlock || status.isFinalized) {
                if (dispatchError) {
                  setIsSubmitting(false);
                  unsub();
                  reject(new Error(formatDispatchError(dispatchError as any)));
                } else {
                  events.forEach(({ event }) => {
                    if (
                      event.section === 'dataAvailability' &&
                      event.method === 'ApplicationKeyCreated'
                    ) {
                      console.log('Event data:', event.data);

                      const appId = Number(event.data[0].toString());
                      const owner = event.data[1].toString();
                      const keyName = event.data[2].toString();

                      const appData = {
                        id: appId,
                        owner: owner,
                        name: keyName,
                        appName: appName,
                      };

                      setGeneratedAppId(appData.id);

                      setIsSubmitting(false);
                      unsub();
                      resolve(appData);
                    }
                  });
                }
              }
            }
          );
      } catch (error) {
        setIsSubmitting(false);
        reject(error);
      }
    });
  };

  const getInjectorMetadata = (
    apiInstance: ApiPromise,
    signedExtensions: string[],
    types: any
  ) => {
    return {
      chain: apiInstance.runtimeChain.toString(),
      specVersion: apiInstance.runtimeVersion.specVersion.toNumber(),
      tokenDecimals: apiInstance.registry.chainDecimals[0] || 18,
      tokenSymbol: apiInstance.registry.chainTokens[0] || 'AVAIL',
      genesisHash: apiInstance.genesisHash.toHex(),
      ss58Format: apiInstance.registry.chainSS58 || 42,
      chainType: 'substrate',
      icon: 'substrate',
      types: types,
      userExtensions: signedExtensions,
    };
  };

  const formatDispatchError = (dispatchError: DispatchError): string => {
    if (!api) return 'Transaction failed: Unknown error.';

    if (dispatchError.isModule) {
      const decoded = api.registry.findMetaError(dispatchError.asModule);
      const { section, name, docs } = decoded;

      const errorMessages = {
        InsufficientBalance: 'Please ensure you have enough funds.',
        Priority: 'Transaction has a low priority.',
        Stale: 'Transaction is outdated and no longer valid.',
        InvalidNonce: 'Please try resending the transaction.',
        CannotLookup: 'Account not found or lookup error.',
        BadSignature: 'The signature is invalid.',
        Future: 'The transaction is from the future.',
      };

      const userMessage = errorMessages[name as keyof typeof errorMessages] || `${section}.${name}: ${docs.join(' ')}`;
      return `Transaction failed: ${userMessage}`;
    } else {
      const errorString = dispatchError.toString();
      return `Transaction failed: ${errorString}`;
    }
  };

  return (
    <SubwalletContext.Provider value={{
      accounts,
      subWalletAddress: subWalletAccount?.address || '',
      api,
      isSubmitting,
      generatedAppId,
      connectSubWallet,
      selectAccount,
      disconnectSubWallet,
      sendTransactionSubwallet,
      createAppId
    }}>
      {children}
    </SubwalletContext.Provider>
  );
};
