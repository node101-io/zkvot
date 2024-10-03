"use client";
import React, { createContext, useState } from "react";
import { toast } from "react-toastify";

export const MinaWalletContext = createContext();

export const MinaWalletProvider = ({ children }) => {
  const [minaWalletAddress, setMinaWalletAddress] = useState(null);

  const connectMinaWallet = async () => {
    try {
      if (!window.mina) {
        toast.error("Mina wallet extension not found. Please install it.");
        return;
      }
      const accounts = await window.mina.requestAccounts();
      if (accounts.length === 0) {
        toast.error("No accounts found in Mina wallet.");
        return;
      }
      const address = accounts[0];
      setMinaWalletAddress(address);
      toast.success("Mina Wallet Connected.");
    } catch (error) {
      console.error("Failed to connect to Mina wallet", error);
      toast.error("Failed to connect to Mina wallet.");
    }
  };

  const disconnectMinaWallet = () => {
    setMinaWalletAddress(null);
    toast.success("Mina Wallet Disconnected.");
  };

  return (
    <MinaWalletContext.Provider
      value={{
        minaWalletAddress,
        connectMinaWallet,
        disconnectMinaWallet,
      }}
    >
      {children}
    </MinaWalletContext.Provider>
  );
};
