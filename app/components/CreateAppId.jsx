"use client";
import React, { useContext } from "react";
import { SubwalletContext } from "@/contexts/SubwalletContext";

export const CreateAppId = ({ onAppIdGenerated }) => {
  const { selectedAccount, isSubmitting, createAppId, connectWallet } =
    useContext(SubwalletContext);

  const handleCreateAppId = async () => {
    if (!selectedAccount) {
      await connectWallet();
    } else {
      try {
        const appData = await createAppId();
        if (onAppIdGenerated) {
          onAppIdGenerated(appData);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleCreateAppId}
        disabled={isSubmitting}
        className={`px-4 rounded-full py-2 ${
          isSubmitting
            ? "bg-gray-400"
            : "bg-transparent border border-[#DFE1E4]"
        } text-white rounded`}
      >
        {isSubmitting
          ? "Submitting..."
          : !selectedAccount
          ? "Connect Wallet"
          : "Create App ID"}
      </button>
    </div>
  );
};

export default CreateAppId;
