"use client";
import React, { useState, useContext } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import StepFour from "./steps/StepFour";
import StepFive from "./steps/StepFive.jsx";

const HomePage = () => {
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
    setElectionData((prevData) => {
      const updatedData = { ...prevData };

      if (
        updatedData.communication_layers &&
        updatedData.communication_layers[0].type === "avail"
      ) {
        updatedData.communication_layers[0].app_id = additionalInput;
      }
      return updatedData;
    });

    setStep(5);
  };

  const handleStepFiveSubmit = (transactionId) => {
    const updatedData = {
      ...electionData,
      transactionId: transactionId.trim(),
    };

    setElectionData(updatedData);

    generateAndDownloadJSON(updatedData);
    setStep(6);
  };

  const generateAndDownloadJSON = (currentElectionData) => {
    const finalElectionData = { ...currentElectionData };

    delete finalElectionData.someComponent;
    delete finalElectionData.someEventObject;

    console.log("Final Election Data:", finalElectionData);

    downloadJSON(finalElectionData);

    setElectionData({ voters_list: [], communication_layers: [] });
    setWallets([]);
  };

  const downloadJSON = (finalElectionData) => {
    if (!finalElectionData) {
      console.error("finalElectionData is undefined or null");
      return;
    }

    if (finalElectionData.picture) {
      finalElectionData.image_raw = finalElectionData.picture;
      delete finalElectionData.picture;
    }

    delete finalElectionData.someComponent;
    delete finalElectionData.someEventObject;

    console.log("Data to be serialized:", finalElectionData);
    const dataStr = JSON.stringify(finalElectionData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "election_data.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

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
            electionData={electionData}
            onPrevious={() => setStep(3)}
            onSubmit={handleStepFourSubmit}
          />
        )}
        {step === 5 && (
          <StepFive
            electionData={electionData}
            downloadJSON={downloadJSON}
            onPrevious={() => setStep(4)}
            onSubmit={handleStepFiveSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
