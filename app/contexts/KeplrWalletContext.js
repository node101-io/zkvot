"use client";
import { useToast } from "@/components/ToastProvider";
import React, { createContext, useState } from "react";

const CELESTIA_CHAIN_PARAMS = {
  chainId: "mocha-4",
  chainName: "Mocha testnet",
  rpc: "https://rpc-mocha.pops.one/",
  rest: "https://api-mocha.pops.one/",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "celestia",
    bech32PrefixAccPub: "celestiapub",
    bech32PrefixValAddr: "celestiavaloper",
    bech32PrefixValPub: "celestiavaloperpub",
    bech32PrefixConsAddr: "celestiavalcons",
    bech32PrefixConsPub: "celestiavalconspub",
  },
  currencies: [
    {
      coinDenom: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 6,
      coinGeckoId: "celestia",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "TIA",
      coinMinimalDenom: "utia",
      coinDecimals: 6,
      coinGeckoId: "celestia",
      gasPriceStep: {
        low: 0.01,
        average: 0.02,
        high: 0.1,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "TIA",
    coinMinimalDenom: "utia",
    coinDecimals: 6,
    coinGeckoId: "celestia",
  },
  features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
};

export const KeplrWalletContext = createContext();

export const KeplrWalletProvider = ({ children }) => {
  const [keplrWalletAddress, setKeplrWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();

  const connectKeplrWallet = async () => {
    try {
      if (!window.keplr) {
        showToast(
          "Keplr wallet extension not found. Please install it.",
          "error"
        );
        return;
      }
      const chainId = CELESTIA_CHAIN_PARAMS.chainId;

      await window.keplr.enable(chainId);

      const offlineSigner = window.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      if (accounts.length === 0) {
        showToast("No accounts found in Keplr wallet.", "error");
        return;
      }
      const address = accounts[0].address;
      setSigner(offlineSigner);
      setKeplrWalletAddress(address);
      showToast("Keplr wallet connected.", "success");
      return true;
    } catch (error) {
      console.error("Failed to connect to Keplr wallet", error);

      showToast("Failed to connect to Keplr wallet.", "error");
      return false;
    }
  };

  const sendTransactionKeplr = async (zkProofData) => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve("success");
      }, 1000);
    });
    return true;
  };

  const disconnectKeplrWallet = () => {
    setKeplrWalletAddress(null);
    setSigner(null);
    showToast("Keplr wallet disconnected.", "success");
  };

  return (
    <KeplrWalletContext.Provider
      value={{
        signer,
        keplrWalletAddress,
        connectKeplrWallet,
        sendTransactionKeplr,
        disconnectKeplrWallet,
        isSubmitting,
      }}
    >
      {children}
    </KeplrWalletContext.Provider>
  );
};
