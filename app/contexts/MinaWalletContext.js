"use client";
import { useToast } from "../components/ToastProvider";
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
      console.log("Raw signature from Mina wallet:", signature);

      if (!signature) {
        showToast("Failed to sign the election ID.", "error");
        return null;
      }

      let r, s;

      if (
        signature.signature &&
        typeof signature.signature.field === "string" &&
        typeof signature.signature.scalar === "string"
      ) {
        r = signature.signature.field;
        s = signature.signature.scalar;
      } else {
        showToast("Unexpected signature format.", "error");
        return null;
      }

      return { r, s };
    } catch (error) {
      console.error("Error signing election ID:", error);
      showToast("Failed to sign the election ID.", "error");
      return null;
    }
  };

  const generateZkProofWithMina = async (electionJson) => {
    const WorkingElectionJson = {
      electionId: "B62qinHTtL5wUL5ccnKudxDWhZYAyWDj2HcvVY1YVLhNXwqN9cceFkz",
      signedElectionId: {
        r: "16346194317455302813137534197593798058813563456069267503760707907206335264689",
        s: "1729086860553450026742784005774108720876791402296158317085038218355413912991",
      },
      vote: 1,
      votersArray: [
        "B62qmFHof1QzKNcF1aVyasHxeMiENiUsqCM2cQTZSJ9QM6yYfyY7X8Q",
        "B62qrnHyqPgN8KJ1ZN4s84YGpijLqxp4wDRH6gUgb8mLJZMpN3QeJkZ",
        "B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon",
      ],
      publicKey: "B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon",
    };
    try {
      const response = await fetch(
        "http://localhost:10102/zk-proof/generate-vote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(WorkingElectionJson),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Failed to generate zk-proof:", errorMessage);
        throw new Error("Failed to generate zk-proof");
      }

      const result = await response.json();
      return {
        proof: result.data || "",
      };
    } catch (error) {
      console.error("Error generating zk-proof:", error);
      return {
        proof: "",
      };
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
