"use client";
import React, { useState } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import StepFour from "./steps/StepFour";
import StepFive from "./steps/StepFive.jsx";
import {
  fetchAvailBlockHeight,
  fetchCelestiaBlockInfo,
} from "@/contexts/FetchLatestBlock";
const HomePage = () => {
  const [step, setStep] = useState(1);
  const [electionData, setElectionData] = useState({
    voters_list: [],
    communication_layers: [],
  });
  const [wallets, setWallets] = useState([]);
  const [isTwitterRequired, setIsTwitterRequired] = useState(false);
  const [blockHeight, setBlockHeight] = useState("");
  const [blockHash, setBlockHash] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleStepThreeSubmit = async (communicationLayersData) => {
    const selectedLayer = communicationLayersData[0];

    if (selectedLayer.type === "celestia") {
      setLoading(true);
      try {
        const response = await fetch(
          `/celestia-generate-namespace?election_id=${encodeURIComponent(
            electionData.question
          )}`
        );
        const result = await response.json();

        if (result.success) {
          const namespaceIdentifier = result.data;

          const updatedCommunicationLayer = {
            ...selectedLayer,
            namespace: namespaceIdentifier,
          };

          setElectionData((prevData) => ({
            ...prevData,
            communication_layers: [updatedCommunicationLayer],
          }));

          try {
            const data = await fetchCelestiaBlockInfo();
            setBlockHeight(data.blockHeight);
            setBlockHash(data.blockHash);

            setElectionData((prevData) => {
              const updatedData = { ...prevData };
              updatedData.communication_layers[0].block_height =
                data.blockHeight;
              updatedData.communication_layers[0].block_hash = data.blockHash;
              return updatedData;
            });

            setLoading(false);
            setStep(4);
          } catch (error) {
            console.error("Error fetching Celestia block data:", error);
            setLoading(false);
            setTimeout(() => {
              setStep(4);
            }, 3000);
          }
        } else {
          setLoading(false);
          console.error("Error generating namespace:", result.error);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching namespace:", error);
      }
    } else if (selectedLayer.type === "avail") {
      setElectionData((prevData) => ({
        ...prevData,
        communication_layers: communicationLayersData,
      }));
      setLoading(true);

      try {
        const height = await fetchAvailBlockHeight();
        setBlockHeight(height);

        setElectionData((prevData) => {
          const updatedData = { ...prevData };
          updatedData.communication_layers[0].block_height = height;
          return updatedData;
        });

        setLoading(false);
        setStep(4);
      } catch (error) {
        console.error("Error fetching Avail block height:", error);
        setLoading(false);
        setTimeout(() => {
          setStep(4);
        }, 3000);
      }
    } else {
      setElectionData((prevData) => ({
        ...prevData,
        communication_layers: communicationLayersData,
      }));
      setStep(4);
    }
  };

  const handleUpdateElectionData = (updatedData) => {
    setElectionData(updatedData);
  };

  const handleStepFourSubmit = (additionalData) => {
    setElectionData((prevData) => {
      const updatedData = { ...prevData };
      const communicationLayer = updatedData.communication_layers[0];

      if (communicationLayer.type === "avail") {
        communicationLayer.app_id = additionalData.app_id;
        communicationLayer.block_height = additionalData.block_height;
      } else if (communicationLayer.type === "celestia") {
        communicationLayer.block_height = additionalData.block_height;
        communicationLayer.block_hash = additionalData.block_hash;
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
            loading={loading}
          />
        )}
        {step === 4 && (
          <StepFour
            electionData={electionData}
            blockHeight={blockHeight}
            blockHash={blockHash}
            onPrevious={() => setStep(3)}
            onSubmit={handleStepFourSubmit}
            onUpdateElectionData={handleUpdateElectionData}
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
