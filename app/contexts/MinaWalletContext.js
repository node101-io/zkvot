"use client";
import { useToast } from "@/components/ToastProvider";
import React, { createContext, useState } from "react";

export const MinaWalletContext = createContext();

export const MinaWalletProvider = ({ children }) => {
  const [minaWalletAddress, setMinaWalletAddress] = useState(null);
  const showToast = useToast();

  const connectMinaWallet = async () => {
    try {
      if (!window.mina) {
        showToast(
          "Mina wallet extension not found. Please install it.",
          "error"
        );
        return false;
      }
      const accounts = await window.mina.requestAccounts();
      if (accounts.length === 0) {
        showToast("No accounts found in Mina wallet.", "error");
        return false;
      }
      const address = accounts[0];
      setMinaWalletAddress(address);

      showToast("Mina Wallet Connected.", "success");

      return true;
    } catch (error) {
      console.error("Failed to connect to Mina wallet", error);

      showToast("Failed to connect to Mina wallet.", "error");
      return false;
    }
  };

  const generateZkProofWithMina = async (electionJson) => {
    try {
      const response = await fetch(
        "http://localhost:10101/zk-proof/generate-vote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(electionJson),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Failed to generate zk-proof:", errorMessage);
        throw new Error("Failed to generate zk-proof");
      }

      const result = await response.json();
      return {
        proof: result.proof || "",
      };
    } catch (error) {
      console.error("Error generating zk-proof:", error);
      return {
        proof: "",
      };
    }
  };

  const signElectionId = async (electionId) => {
    try {
      if (!window.mina) {
        showToast(
          "Mina wallet extension not found. Please install it.",
          "error"
        );
        return null;
      }

      const signature = await window.mina.signMessage({ message: electionId });
      if (!signature) {
        showToast("Failed to sign the election ID.", "error");
        return null;
      }

      const { field, scalar } = signature.signature || {};

      return {
        field,
        scalar,
      };
    } catch (error) {
      console.error("Error signing election ID:", error);
      showToast("Failed to sign the election ID.", "error");
      return null;
    }
  };

  const disconnectMinaWallet = () => {
    setMinaWalletAddress(null);

    showToast("Mina Wallet Disconnected.", "success");
  };

  return (
    <MinaWalletContext.Provider
      value={{
        signElectionId,
        minaWalletAddress,
        generateZkProofWithMina,
        connectMinaWallet,
        disconnectMinaWallet,
      }}
    >
      {children}
    </MinaWalletContext.Provider>
  );
};
