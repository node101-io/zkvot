"use client";
import { useToast } from "@/app/(partials)/ToastProvider";
import React, { createContext, useState } from "react";

interface MetamaskWalletWalletContextInterface {
  minaWalletAddress: string;
  setMetamaskWalletWalletAddress: Dispatch<
    SetStateAction<MetamaskWalletWalletContextInterface['minaWalletAddress']>
  >;
  connectMetamaskWalletWallet: () => Promise<void>;
  signElectionId: (electionId: string) => Promise<string | Error>;
  generateEncodedVoteProof: (vote: {
    electionId: string;
    signedElectionId: string;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }) => Promise<string | Error>;
  disconnectMetamaskWalletWallet: () => void;
};

export const MetamaskWalletWalletContext = createContext<MetamaskWalletWalletContextInterface>({
  minaWalletAddress: '',
  setMetamaskWalletWalletAddress: () => {},
  connectMetamaskWalletWallet: async () => {},
  signElectionId: async () => '',
  generateEncodedVoteProof: async () => '',
  disconnectMetamaskWalletWallet: () => {},
});

export const MetamaskWalletProvider = ({ children }) => {
  const [metamaskWalletAddress, setMetamaskWalletAddress] = useState(null);
  const showToast = useToast();

  const connectMetamaskWallet = async () => {
    try {
      if (!window.ethereum) {
        showToast("Metamask not found. Please install it.", "error");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) {
        showToast("No accounts found in Metamask.", "error");
        return;
      }
      const address = accounts[0];
      setMetamaskWalletAddress(address);
      showToast("Metamask connected.", "success");
      return true;
    } catch (error) {
      console.error("Failed to connect to Metamask", error);
      showToast("Failed to connect to Metamask.", "error");
      return false;
    }
  };

  const generateZkProofWithMetamask = async (choice, electionData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      proof: "dummy_metamask_proof",
      publicSignals: {
        electionId: electionData.electionId,
        choice: choice,
        timestamp: Date.now(),
      },
    };
  };

  const disconnectMetamaskWallet = () => {
    setMetamaskWalletAddress(null);
    showToast("Metamask disconnected.", "success");
  };

  return (
    <MetamaskWalletContext.Provider
      value={{
        metamaskWalletAddress,
        generateZkProofWithMetamask,
        connectMetamaskWallet,
        disconnectMetamaskWallet,
      }}
    >
      {children}
    </MetamaskWalletContext.Provider>
  );
};
