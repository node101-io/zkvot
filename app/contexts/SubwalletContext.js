"use client";
import React, { createContext, useState, useEffect } from "react";
import {
  web3Enable,
  web3Accounts,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { initialize, signedExtensions, types } from "avail-js-sdk";
import { Buffer } from "buffer";
import { useToast } from "@/components/ToastProvider";

export const SubwalletContext = createContext();

export const SubwalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setApi] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();
  const getInjectorMetadata = (api) => {
    return {
      chain: api.runtimeChain.toString(),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      tokenDecimals: api.registry.chainDecimals[0] || 18,
      tokenSymbol: api.registry.chainTokens[0] || "AVAIL",
      genesisHash: api.genesisHash.toHex(),
      ss58Format: api.registry.chainSS58 || 42,
      chainType: "substrate",
      icon: "substrate",
      types: types,
      userExtensions: signedExtensions,
    };
  };

  const initializeApi = async () => {
    try {
      const newApi = await initialize("wss://turing-rpc.avail.so/ws");
      setApi(newApi);
      console.log("API initialized");
    } catch (error) {
      console.error("Failed to initialize API:", error);
    }
  };

  useEffect(() => {
    initializeApi();

    return () => {
      if (api && api.isConnected) {
        api.disconnect();
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable("Your App Name");
      if (extensions.length === 0) {
        console.warn("No extensions installed.");
        showToast("No extensions installed.", "error");
        return;
      }
      const injectedAccounts = await web3Accounts();
      const accountsWithProvenance = injectedAccounts.map((account) => ({
        ...account,
        source: account.meta.source,
      }));
      setAccounts(accountsWithProvenance);

      if (accountsWithProvenance.length > 0) {
        setSelectedAccount(accountsWithProvenance[0]);
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
      const injector = await web3FromSource(account.source);
      if (injector.metadata) {
        const metadata = getInjectorMetadata(api);
        await injector.metadata.provide(metadata);
      }
    }
    showToast("Account selected.", "success");
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
  };

  const sendTransactionSubwallet = async (zkProofData) => {
    // if (!api || !selectedAccount) {
    //   showToast("Please connect a wallet first.", "error");
    //   return false;
    // }

    // try {
    //   setIsSubmitting(true);

    //   const injector = await web3FromSource(selectedAccount.source);
    //   api.setSigner(injector.signer);

    //   const encodedData = Buffer.from(JSON.stringify(zkProofData)).toString(
    //     "base64"
    //   );
    //   const tx = api.tx.dataAvailability.submitData(encodedData);

    //   const result = await new Promise((resolve) => {
    //     let alreadyHandled = false;

    //     tx.signAndSend(
    //       selectedAccount.address,
    //       { signer: injector.signer },
    //       ({ status, events, dispatchError }) => {
    //         if (alreadyHandled) return;

    //         if (dispatchError) {
    //           handleDispatchError(dispatchError);
    //           setIsSubmitting(false);
    //           alreadyHandled = true;
    //           resolve(false);
    //           return;
    //         }

    //         if (status.isFinalized) {
    //           const successEvent = events.find(
    //             ({ event }) =>
    //               event.section === "dataAvailability" &&
    //               event.method === "DataSubmitted"
    //           );

    //           if (successEvent) {
    //             console.log(
    //               "Data submitted:",
    //               successEvent.event.data.toHuman()
    //             );
    //             showToast("Transaction successful.", "success");
    //             setIsSubmitting(false);
    //             alreadyHandled = true;
    //             resolve(true);
    //           } else {
    //             setIsSubmitting(false);
    //             alreadyHandled = true;
    //             resolve(false);
    //           }
    //         }
    //       }
    //     ).catch((error) => {
    //       console.error("Transaction error:", error);
    //       setIsSubmitting(false);
    //       resolve(false);
    //     });
    //   });

    //   return result;
    // } catch (error) {
    //   console.error("Error sending transaction:", error);
    //   showToast("Error sending transaction.", "error");
    //   setIsSubmitting(false);
    //   return false;
    // }
    return true;
  };

  const handleDispatchError = (dispatchError) => {
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
      showToast(`Transaction failed:`, "error");
      console.error(`${section}.${name}: ${docs.join(" ")}`);
    } else {
      const errorString = dispatchError.toString();
      console.error(errorString);
      showToast(`Transaction failed:`, "error");
    }
  };

  return (
    <SubwalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        connectWallet,
        selectAccount,
        disconnectWallet,
        api,
        sendTransactionSubwallet,
        isSubmitting,
      }}
    >
      {children}
    </SubwalletContext.Provider>
  );
};
