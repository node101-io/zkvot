"use client";
import React, { useContext, useState, useEffect } from "react";
import { SubwalletContext } from "../contexts/SubwalletContext";

const PlusIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.0547 6.5022L0.941325 6.5022"
      stroke="#AFEEEE"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 0.943359L6.5 12.0567"
      stroke="#AFEEEE"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CreateAppId = ({ onAppIdGenerated }) => {
  const { selectedAccount, isSubmitting, createAppId, connectWallet } =
    useContext(SubwalletContext);

  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    setIsCreated(false);
  }, [selectedAccount]);

  const handleCreateAppId = async () => {
    if (!selectedAccount) {
      await connectWallet();
    } else {
      try {
        const appData = await createAppId();
        if (appData && appData.id) {
          setIsCreated(true);
          if (onAppIdGenerated) {
            onAppIdGenerated(appData);
          }
        } else {
          throw new Error("Invalid App ID data");
        }
      } catch (error) {
        console.error("Error creating App ID:", error);
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleCreateAppId}
        disabled={isSubmitting || isCreated}
        className={`px-4 rounded-full py-4 flex flex-row justify-center items-center gap-x-2 transition-colors duration-300 ${
          isSubmitting || isCreated
            ? "bg-[#333] cursor-not-allowed"
            : "bg-[#1E1E1E] hover:bg-[#333]"
        } text-white rounded`}
      >
        {isSubmitting ? (
          "Submitting..."
        ) : isCreated ? (
          <>App ID Created</>
        ) : (
          <>
            <PlusIcon />
            {!selectedAccount ? "Connect Wallet" : "Create App ID"}
          </>
        )}
      </button>
    </div>
  );
};

export default CreateAppId;
