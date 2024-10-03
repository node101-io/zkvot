"use client";
import React, { useState, useContext } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import axios from "axios";
import Button from "@/components/common/Button";
import { MinaWalletContext } from "@/contexts/MinaWalletContext";

const HomePage = () => {
  const { minaWalletAddress, connectMinaWallet } =
    useContext(MinaWalletContext);
  const [step, setStep] = useState(1);
  const [stepOneData, setStepOneData] = useState({});
  const [wallets, setWallets] = useState([]);
  const [isTwitterRequired, setIsTwitterRequired] = useState(false);

  const handleStepOneNext = (data) => {
    setStepOneData(data);
    setStep(2);
  };

  const handleStepTwoSubmit = async (wallets) => {
    const payload = { ...stepOneData, wallets };
    await axios.post("/api/submit-data", payload);
    console.log("Data submitted", payload);
    setStep(1);
  };

  if (!minaWalletAddress) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center text-white space-y-4">
          <p>Please connect your wallet to continue.</p>
          <Button
            onClick={connectMinaWallet}
            className="px-4 py-2 bg-blue-500 rounded text-white"
          >
            Connect Mina Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full py-12">
      <div className="w-[1062px] h-full p-6 rounded-lg">
        {step === 1 ? (
          <StepOne
            onNext={handleStepOneNext}
            initialData={stepOneData}
          />
        ) : (
          <StepTwo
            onPrevious={() => setStep(1)}
            onSubmit={handleStepTwoSubmit}
            wallets={wallets}
            setWallets={setWallets}
            isTwitterRequired={isTwitterRequired}
            setIsTwitterRequired={setIsTwitterRequired}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
