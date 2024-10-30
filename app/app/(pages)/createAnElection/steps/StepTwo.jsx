"use client";

import React, { useState } from "react";
import Button from "../../../../components/common/Button";
import WalletInput from "./stepTwoComponent/WalletInput";
import WalletList from "./stepTwoComponent/WalletList";

const StepTwo = ({ onPrevious, onSubmit }) => {
  const [wallets, setWallets] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [customOptionNames, setCustomOptionNames] = useState({});

  const isSubmitEnabled = wallets.length > 0;

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      onSubmit(wallets);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-215px)] p-4">
      <div className="mb-4">
        <h3 className="text-white text-xl">Step 2: Add Wallet Addresses</h3>
      </div>

      <div className="mb-8">
        <WalletInput
          wallets={wallets}
          setWallets={setWallets}
          requiredFields={requiredFields}
          setRequiredFields={setRequiredFields}
          customOptionNames={customOptionNames}
          setCustomOptionNamesInParent={setCustomOptionNames}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <WalletList
          wallets={wallets}
          setWallets={setWallets}
          requiredFields={requiredFields}
          customOptionNames={customOptionNames}
        />
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={`${
            !isSubmitEnabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
