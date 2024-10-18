"use client";
import React, { useState, useContext } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import StepFour from "./steps/StepFour";
import Button from "@/components/common/Button";
import { MinaWalletContext } from "@/contexts/MinaWalletContext";

const HomePage = () => {
  const { minaWalletAddress, connectMinaWallet } =
    useContext(MinaWalletContext);
  const [step, setStep] = useState(1);

  const [electionData, setElectionData] = useState({
    voters_list: [],
    communication_layers: [],
  });

  const [wallets, setWallets] = useState([]);
  const [isTwitterRequired, setIsTwitterRequired] = useState(false);

  const handleStepOneNext = (data) => {
    setElectionData((prevData) => ({
      ...prevData,
      ...data,
    }));
    setStep(2);
  };

  const handleStepTwoSubmit = (walletsData) => {
    setElectionData((prevData) => ({
      ...prevData,
      voters_list: walletsData,
    }));
    setStep(3);
  };

  const handleStepThreeSubmit = (communicationLayersData) => {
    setElectionData((prevData) => ({
      ...prevData,
      communication_layers: communicationLayersData,
    }));
    setStep(4);
  };

  const handleStepFourSubmit = (additionalInput) => {
    setElectionData((prevData) => ({
      ...prevData,
      additional_input: additionalInput,
    }));

    generateAndDownloadJSON();
  };

  const generateAndDownloadJSON = () => {
    const finalElectionData = { ...electionData };

    if (finalElectionData.picture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        finalElectionData.image_raw = reader.result;
        delete finalElectionData.picture;

        downloadJSON(finalElectionData);

        setStep(1);
        setElectionData({ voters_list: [], communication_layers: [] });
        setWallets([]);
      };
      reader.readAsDataURL(finalElectionData.picture);
    } else {
      downloadJSON(finalElectionData);

      setStep(1);
      setElectionData({ voters_list: [], communication_layers: [] });
      setWallets([]);
    }
  };

  const downloadJSON = (data) => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "election_data.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    console.log("Data ready to be submitted:", data);
  };

  if (!minaWalletAddress) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
        {step === 1 && (
          <StepOne
            onNext={handleStepOneNext}
            initialData={electionData}
          />
        )}
        {step === 2 && (
          <StepTwo
            onPrevious={() => setStep(1)}
            onSubmit={handleStepTwoSubmit}
            wallets={wallets}
            setWallets={setWallets}
            isTwitterRequired={isTwitterRequired}
            setIsTwitterRequired={setIsTwitterRequired}
          />
        )}
        {step === 3 && (
          <StepThree
            onPrevious={() => setStep(2)}
            onSubmit={handleStepThreeSubmit}
          />
        )}
        {step === 4 && (
          <StepFour
            onPrevious={() => setStep(3)}
            onSubmit={handleStepFourSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
