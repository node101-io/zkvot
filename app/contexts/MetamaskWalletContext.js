"use client";
import React, { createContext, useState } from "react";
import { toast } from "react-toastify";

export const MetamaskWalletContext = createContext();

export const MetamaskWalletProvider = ({ children }) => {
  const [metamaskWalletAddress, setMetamaskWalletAddress] = useState(null);

  const connectMetamaskWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Metamask not found. Please install it.");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) {
        toast.error("No accounts found in Metamask.");
        return;
      }
      const address = accounts[0];
      setMetamaskWalletAddress(address);
      toast.success("Metamask Connected.");
      return true;
    } catch (error) {
      console.error("Failed to connect to Metamask", error);
      toast.error("Failed to connect to Metamask.");
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
    toast.success("Metamask Disconnected.");
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
