import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import WalletInput from "./stepTwoComponent/WalletInput";
import WalletList from "./stepTwoComponent/WalletList";

const StepTwo = ({
  onPrevious,
  onSubmit,
  wallets,
  setWallets,
  isTwitterRequired,
  setIsTwitterRequired,
}) => {
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  useEffect(() => {
    setIsSubmitEnabled(wallets.length > 0);
  }, [wallets]);

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
        isTwitterRequired={isTwitterRequired}
        setIsTwitterRequired={setIsTwitterRequired}
      />
      <WalletList
        wallets={wallets}
        setWallets={setWallets}
        isTwitterRequired={isTwitterRequired}
        setIsTwitterRequired={setIsTwitterRequired}
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
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
