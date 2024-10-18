import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
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
    <div className="flex flex-col items-center space-y-4 p-4 bg-[#121315] rounded-lg w-full">
      <h3 className="text-white">Step 2: Add Wallet Addresses</h3>
      <WalletInput
        wallets={wallets}
        setWallets={setWallets}
        requiredFields={requiredFields}
        setRequiredFields={setRequiredFields}
        customOptionNames={customOptionNames}
        setCustomOptionNamesInParent={setCustomOptionNames}
      />
      <WalletList
        wallets={wallets}
        setWallets={setWallets}
        requiredFields={requiredFields}
        customOptionNames={customOptionNames}
      />
      <div className="w-full flex justify-between">
        <Button
          onClick={onPrevious}
          className="mt-4"
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          className={`mt-4 ${
            !isSubmitEnabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isSubmitEnabled}
        >
          next
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
