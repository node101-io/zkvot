"use client";

import { Dispatch, SetStateAction, createContext, useState, useEffect, PropsWithChildren } from "react";
import { Buffer } from "buffer";
import { initialize as initAvailAPI, ApiPromise } from 'avail-js-sdk';

export interface SubWalletContextInterface {
  accounts: string[];
  setAccounts: Dispatch<
    SetStateAction<SubWalletContextInterface['accounts']>
  >;
  selectedAccount: string;
  setSelectedAccount: Dispatch<
    SetStateAction<SubWalletContextInterface['selectedAccount']>
  >;
  api: ApiPromise | null;
  setApi: Dispatch<
    SetStateAction<SubWalletContextInterface['api']>
  >;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<
    SetStateAction<SubWalletContextInterface['isSubmitting']>
  >;
  generatedAppId: number;
  setGeneratedAppId: Dispatch<
    SetStateAction<SubWalletContextInterface['generatedAppId']>
  >;
};

export const SubwalletContext = createContext({
  accounts: [],
  setAccounts: () => {},
  selectedAccount: '',
  setSelectedAccount: () => {},
  api: null,
  setApi: () => {},
  isSubmitting: false,
  setIsSubmitting: () => {},
  generatedAppId: -1,
  setGeneratedAppId: () => {},
});

export const SubwalletProvider = ({
  children
}: PropsWithChildren<{}>) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setApi] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedAppId, setGeneratedAppId] = useState(-1);

  useEffect(() => {
    const initializeApi = async (): Promise<void> => {
      try {
        const newApi = await initAvailAPI("wss://turing-rpc.avail.so/ws");

        setApi(newApi);
      } catch (error) {
        throw new Error("Failed to initialize API.");
      }
    };

    initializeApi();

    return () => {
      if (api && api.isConnected) {
        api.disconnect();
        console.log("API disconnected");
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      const { web3Enable, web3Accounts } = await import(
        "@polkadot/extension-dapp"
      );
      const extensions = await web3Enable("Your App Name");

      if (extensions.length === 0) {
        console.warn("No extensions installed.");
        showToast("No extensions installed.", "error");
        return;
      }

      const injectedAccounts = await web3Accounts();
      const accountsWithSource = injectedAccounts.map((account) => ({
        ...account,
        source: account.meta.source,
      }));

      setAccounts(accountsWithSource);

      if (accountsWithSource.length > 0) {
        setSelectedAccount(accountsWithSource[0]);
      }

      showToast("Subwallet connected.", "success");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      showToast("Failed to connect wallet.", "error");
    }
  };

  const selectAccount = async (account) => {
    setSelectedAccount(account);

    if (api) {
      try {
        const { web3FromSource } = await import("@polkadot/extension-dapp");
        const injector = await web3FromSource(account.source);

        if (injector.metadata) {
          const { signedExtensions, types } = await import("avail-js-sdk");
          const metadata = getInjectorMetadata(api, signedExtensions, types);
          await injector.metadata.provide(metadata);
        }

        showToast("Account selected.", "success");
      } catch (error) {
        console.error("Failed to select account:", error);
        showToast("Failed to select account.", "error");
      }
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    showToast("Wallet disconnected.", "success");
  };

  const sendTransactionSubwallet = async (zkProofData) => {
    if (!api || !selectedAccount) {
      showToast("Please connect a wallet first.", "error");
      return false;
    }

    try {
      setIsSubmitting(true);

      const { web3FromSource } = await import("@polkadot/extension-dapp");
      const injector = await web3FromSource(selectedAccount.source);
      api.setSigner(injector.signer);

      const encodedData = Buffer.from(JSON.stringify(zkProofData)).toString(
        "base64"
      );
      const tx = api.tx.dataAvailability.submitData(encodedData);

      const result = await new Promise((resolve) => {
        let alreadyHandled = false;

        tx.signAndSend(
          selectedAccount.address,
          { signer: injector.signer },
          ({ status, events, dispatchError }) => {
            if (alreadyHandled) return;

            if (dispatchError) {
              handleDispatchError(dispatchError);
              setIsSubmitting(false);
              alreadyHandled = true;
              resolve(false);
              return;
            }

            if (status.isFinalized) {
              const successEvent = events.find(
                ({ event }) =>
                  event.section === "dataAvailability" &&
                  event.method === "DataSubmitted"
              );

              if (successEvent) {
                console.log(
                  "Data submitted:",
                  successEvent.event.data.toHuman()
                );
                showToast("Transaction successful.", "success");
                setIsSubmitting(false);
                alreadyHandled = true;
                resolve(true);
              } else {
                setIsSubmitting(false);
                alreadyHandled = true;
                resolve(false);
              }
            }
          }
        ).catch((error) => {
          console.error("Transaction error:", error);
          setIsSubmitting(false);
          resolve(false);
        });
      });

      return result;
    } catch (error) {
      console.error("Error sending transaction:", error);
      showToast("Error sending transaction.", "error");
      setIsSubmitting(false);
      return false;
    }
  };

  const createAppId = async () => {
    if (!api || !selectedAccount) {
      showToast("Please connect your wallet and select an account.", "error");
      return null;
    }

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const appName = `zkVot - ${randomNumber}`;

    setIsSubmitting(true);

    return new Promise(async (resolve, reject) => {
      try {
        const { web3FromSource } = await import("@polkadot/extension-dapp");
        const injector = await web3FromSource(selectedAccount.source);

        const unsub = await api.tx.dataAvailability
          .createApplicationKey(appName)
          .signAndSend(
            selectedAccount.address,
            { app_id: 0, signer: injector.signer },
            ({ status, events, dispatchError }) => {
              if (status.isInBlock || status.isFinalized) {
                if (dispatchError) {
                  handleDispatchError(dispatchError);
                  setIsSubmitting(false);
                  unsub();
                  reject(new Error("Transaction failed"));
                } else {
                  events.forEach(({ event }) => {
                    if (
                      event.section === "dataAvailability" &&
                      event.method === "ApplicationKeyCreated"
                    ) {
                      console.log("Event data:", event.data);

                      const appId = event.data[0].toString();
                      const owner = event.data[1].toString();
                      const keyName = event.data[2].toString();

                      const appData = {
                        id: appId,
                        owner: owner,
                        name: keyName,
                        appName: appName,
                      };

                      setGeneratedAppId(appData);
                      showToast(
                        "Application Key created successfully!",
                        "success"
                      );

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
        console.error("Error creating Application Key:", error);
        showToast(
          "An error occurred while creating the Application Key.",
          "error"
        );
        setIsSubmitting(false);
        reject(error);
      }
    });
  };

  const getInjectorMetadata = (apiInstance, signedExtensions, types) => {
    return {
      chain: apiInstance.runtimeChain.toString(),
      specVersion: apiInstance.runtimeVersion.specVersion.toNumber(),
      tokenDecimals: apiInstance.registry.chainDecimals[0] || 18,
      tokenSymbol: apiInstance.registry.chainTokens[0] || "AVAIL",
      genesisHash: apiInstance.genesisHash.toHex(),
      ss58Format: apiInstance.registry.chainSS58 || 42,
      chainType: "substrate",
      icon: "substrate",
      types: types,
      userExtensions: signedExtensions,
    };
  };

  const handleDispatchError = (dispatchError) => {
    if (!api) return;

    if (dispatchError.isModule) {
      const decoded = api.registry.findMetaError(dispatchError.asModule);
      const { section, name, docs } = decoded;

      const errorMessages = {
        InsufficientBalance: "Please ensure you have enough funds.",
        Priority: "Transaction has a low priority.",
        Stale: "Transaction is outdated and no longer valid.",
        InvalidNonce: "Please try resending the transaction.",
        CannotLookup: "Account not found or lookup error.",
        BadSignature: "The signature is invalid.",
        Future: "The transaction is from the future.",
      };

      const userMessage =
        errorMessages[name] || `${section}.${name}: ${docs.join(" ")}`;
      showToast(`Transaction failed: ${userMessage}`, "error");
      console.error(`Dispatch Error: ${section}.${name}: ${docs.join(" ")}`);
    } else {
      const errorString = dispatchError.toString();
      console.error("Dispatch Error:", errorString);
      showToast(`Transaction failed: ${errorString}`, "error");
    }
  };

  const contextValue = {
    accounts,
    selectedAccount,
    connectWallet,
    selectAccount,
    disconnectWallet,
    api,
    sendTransactionSubwallet,
    isSubmitting,
    createAppId,
    generatedAppId,
  };

  return (
    <SubwalletContext.Provider value={contextValue}>
      {children}
    </SubwalletContext.Provider>
  );
};
