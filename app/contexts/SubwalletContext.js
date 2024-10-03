"use client";
import React, { createContext, useState, useEffect } from "react";
import {
  web3Enable,
  web3Accounts,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { toast } from "react-toastify";
import { WaitFor } from "avail-js-sdk/sdk/transactions";

export const SubwalletContext = createContext();

export const SubwalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    const initApi = async () => {
      try {
        const provider = new WsProvider(
          "wss://avail-mainnet.public.blastapi.io/"
        );
        const api = await ApiPromise.create({ provider });
        setApi(api);
      } catch (error) {
        console.error("Failed to initialize API:", error);
      }
    };

    initApi();

    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable("Your App Name");
      if (extensions.length === 0) {
        console.warn("No extensions installed.");
        toast.error("No extensions installed.");
        return;
      }
      const injectedAccounts = await web3Accounts();
      setAccounts(injectedAccounts);
      if (injectedAccounts.length > 0) {
        setSelectedAccount(injectedAccounts[0]);
      }
      toast.success("Subwallet connected.");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet.");
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    toast.success("Disconnected.");
  };

  const sendTransactionSubwallet = async (jsonData) => {
    if (!api || !selectedAccount) {
      toast.error("Please connect your wallet and select an account.");
      return;
    }

    try {
      const injector = await web3FromSource(selectedAccount.meta.source);
      api.setSigner(injector.signer);

      const dataString = JSON.stringify(jsonData);

      await api.tx.dataAvailability.submitData(
        dataString,
        WaitFor.BlockInclusion,
        selectedAccount.address
      );
      // .remark(dataString)
      // .data(dataString)
      // .signAndSend(
      //   selectedAccount.address,
      //   { signer: injector.signer },
      //   ({ status, dispatchError }) => {
      //     if (status.isInBlock || status.isFinalized) {
      //       if (dispatchError) {
      //         let message = dispatchError.type;

      //         if (dispatchError.isModule) {
      //           const decoded = api.registry.findMetaError(
      //             dispatchError.asModule
      //           );
      //           message = `${decoded.section}.${
      //             decoded.name
      //           }: ${decoded.docs.join(" ")}`;
      //         }

      //         toast.error(`Transaction failed: ${message}`);
      //         unsub();
      //       } else {
      //         toast.success("Transaction sent successfully!");
      //         unsub();
      //       }
      //     }
      //   }
      // );
      console.log("Data=" + result.txData.data);
      console.log(
        "Who=" + result.event.who + ", DataHash=" + result.event.dataHash
      );
      console.log(
        "TxHash=" + result.txHash + ", BlockHash=" + result.blockHash
      );
    } catch (error) {
      console.log("result.reason", error);
    }
  };

  return (
    <SubwalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        connectWallet,
        disconnectWallet,
        api,
        sendTransactionSubwallet,
      }}
    >
      {children}
    </SubwalletContext.Provider>
  );
};
