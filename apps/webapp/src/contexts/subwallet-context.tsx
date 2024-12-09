'use client';

import { createContext, useState, useEffect, PropsWithChildren } from 'react';
import { initialize as initAvailAPI, ApiPromise } from 'avail-js-sdk';
import { KeypairType } from '@polkadot/util-crypto/types';
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

interface SubwalletContextInterface {
  accounts: Account[];
  subwalletAccount: Account | null;
  api: ApiPromise | null;
  isSubmitting: boolean;
  generatedAppId: number;
  connectSubwallet: () => Promise<boolean>;
  selectAccount: (account: Account) => void;
  disconnectSubwallet: () => void;
  createAppId: (appName: string) => Promise<number>;
  submitDataToAvailViaSubwallet: (zkProofData: string) => Promise<boolean>;
}

export const SubwalletContext = createContext<SubwalletContextInterface>({
  accounts: [],
  subwalletAccount: null,
  api: null,
  isSubmitting: false,
  generatedAppId: 0,
  connectSubwallet: async () => false,
  selectAccount: () => {},
  disconnectSubwallet: () => {},
  createAppId: async () => 0,
  submitDataToAvailViaSubwallet: async () => false,
});

export const SubwalletProvider = ({ children }: PropsWithChildren<{}>) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [subwalletAccount, setSubwalletAccount] = useState<Account | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedAppId, setGeneratedAppId] = useState<number>(0);

  useEffect(() => {
    const initializeApi = async () => {
      try {
        const newApi = await initAvailAPI('wss://turing-rpc.avail.so/ws');
        setApi(newApi);
      } catch (error) {
        console.error('Failed to initialize API:', error);
      }
    };

    initializeApi();

    return () => {
      if (api?.isConnected) {
        api.disconnect();
        console.log('API disconnected');
      }
    };
  }, []);

  const connectSubwallet = async (): Promise<boolean> => {
    try {
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');

      const extensions = await web3Enable('zkVot');
      if (extensions.length === 0) throw new Error('No extensions installed.');

      const injectedAccounts = await web3Accounts();

      const accountsWithSource = injectedAccounts.map((account) => ({
        ...account,
        source: account.meta.source,
      }));

      setAccounts(accountsWithSource);

      if (accountsWithSource.length > 0)
        setSubwalletAccount(accountsWithSource[0]);

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  };

  const selectAccount = (account: Account) => {
    setSubwalletAccount(account);
  };

  const disconnectSubwallet = () => {
    setAccounts([]);
    setSubwalletAccount(null);
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

  const submitDataToAvailViaSubwallet = async (zkProofData: string): Promise<boolean> => {
    if (!api || !subwalletAccount)
      throw new Error ('Please connect a wallet first.');

    try {
      setIsSubmitting(true);

      const { web3FromSource } = await import('@polkadot/extension-dapp');

      const injector = await web3FromSource(subwalletAccount.source);
      api.setSigner(injector.signer as any);

      const encodedData = Buffer.from(JSON.stringify(zkProofData)).toString(
        'base64'
      );
      const tx = api.tx.dataAvailability.submitData(encodedData);

      const result: boolean = await new Promise((resolve) => {
        let alreadyHandled = false;

        tx.signAndSend(
          subwalletAccount.address,
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

  const createAppId = async (appName: string): Promise<number> => {
    if (!api || !subwalletAccount)
      throw new Error('Please connect your wallet and select an account.');

    setIsSubmitting(true);
    setGeneratedAppId(0);

    try {
      const { web3FromSource } = await import('@polkadot/extension-dapp');

      const injector = await web3FromSource(subwalletAccount.source);

      return new Promise<number>((resolve, reject) => {
        api.tx.dataAvailability
          .createApplicationKey(appName)
          .signAndSend(
            subwalletAccount.address,
            { app_id: 0, signer: injector.signer } as any,
            ({ status, events, dispatchError }) => {
              if (status.isInBlock || status.isFinalized) {
                if (dispatchError) {
                  let errorMessage = 'Transaction failed.';

                  if (dispatchError.isModule) {
                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                    errorMessage = decoded.docs.join(' ') || 'An unknown error occurred.';
                  }

                  setIsSubmitting(false);
                  reject(new Error(errorMessage));
                } else {
                  const appCreatedEvent = events.find(
                    ({ event }) =>
                      event.section === 'dataAvailability' &&
                      event.method === 'ApplicationKeyCreated'
                  );

                  if (appCreatedEvent) {
                    const data: any = appCreatedEvent.event.data.toHuman();

                    console.log({
                      id: data.id,
                      owner: data.owner,
                      name: data.key,
                    });

                    setGeneratedAppId(data.id);
                    setIsSubmitting(false);
                    resolve(data.id);
                  } else {
                    setIsSubmitting(false);
                    reject(new Error('Failed to create Application Key.'));
                  }
                }
              }
            }
          );
      });
    } catch (error) {
      console.error('Error creating Application ID:', error);
      setIsSubmitting(false);
      throw new Error('Error creating Application ID.');
    }
  };

  return (
    <SubwalletContext.Provider
      value={{
        accounts,
        subwalletAccount,
        api,
        isSubmitting,
        generatedAppId,
        connectSubwallet,
        selectAccount,
        disconnectSubwallet,
        createAppId,
        submitDataToAvailViaSubwallet
      }}
    >
      {children}
    </SubwalletContext.Provider>
  );
};
