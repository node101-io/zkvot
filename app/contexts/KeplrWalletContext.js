"use client";
import React, { createContext, useState } from "react";
import { toast } from "react-toastify";

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

  const connectKeplrWallet = async () => {
    try {
      if (!window.keplr) {
        toast.error("Keplr wallet extension not found. Please install it.");
        return;
      }
      const chainId = CELESTIA_CHAIN_PARAMS.chainId;

      await window.keplr.enable(chainId);

      const offlineSigner = window.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      if (accounts.length === 0) {
        toast.error("No accounts found in Keplr wallet.");
        return;
      }
      const address = accounts[0].address;
      setSigner(offlineSigner);
      setKeplrWalletAddress(address);
      toast.success("Keplr Wallet Connected.");
      return true;
    } catch (error) {
      console.error("Failed to connect to Keplr wallet", error);
      toast.error("Failed to connect to Keplr wallet.");
      return false;
    }
  };

  const disconnectKeplrWallet = () => {
    setKeplrWalletAddress(null);
    setSigner(null);
    toast.success("Keplr Wallet Disconnected.");
  };

  return (
    <KeplrWalletContext.Provider
      value={{
        keplrWalletAddress,
        signer,
        connectKeplrWallet,
        disconnectKeplrWallet,
      }}
    >
      {children}
    </KeplrWalletContext.Provider>
  );
};
