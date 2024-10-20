"use client";
import React, { useState } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import StepFour from "./steps/StepFour";
import StepFive from "./steps/StepFive";
import StepSix from "./steps/StepSix";
import StepSeven from "./steps/StepSeven";

import {
  fetchAvailBlockHeight,
  fetchCelestiaBlockInfo,
} from "@/contexts/FetchLatestBlock";

import {
  fetchDataFromIPFS,
  fetchDataFromFilecoin,
  fetchDataFromArweave,
} from "@/utils/StorageUtils";

const HomePage = () => {
  const [step, setStep] = useState(1);
  const [electionData, setElectionData] = useState({
    voters_list: [],
    communication_layers: [],
    storageLayer: "",
    transactionId: "",
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
    setLoading(true);

    try {
      if (selectedLayer.type === "celestia") {
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

          const data = await fetchCelestiaBlockInfo();
          setBlockHeight(data.blockHeight);
          setBlockHash(data.blockHash);
          setElectionData((prevData) => {
            const updatedData = { ...prevData };
            updatedData.communication_layers[0].block_height = data.blockHeight;
            updatedData.communication_layers[0].block_hash = data.blockHash;
            return updatedData;
          });
        } else {
          throw new Error("Error generating namespace.");
        }
      } else if (selectedLayer.type === "avail") {
        const height = await fetchAvailBlockHeight();
        setBlockHeight(height);
        setElectionData((prevData) => {
          const updatedData = { ...prevData };
          updatedData.communication_layers[0].block_height = height;
          return updatedData;
        });
      } else {
        setElectionData((prevData) => ({
          ...prevData,
          communication_layers: communicationLayersData,
        }));
      }
      setStep(4);
    } catch (error) {
      console.error("Error during Step Three:", error);
    } finally {
      setLoading(false);
    }
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

  const handleStepFiveSubmit = (selectedStorageLayer) => {
    setElectionData((prevData) => ({
      ...prevData,
      storageLayer: selectedStorageLayer,
    }));
    setStep(6);
  };

  const handleStepSixSubmit = (transactionId, setErrorMessage) => {
    console.log("electionData.storageLayer:", electionData.storageLayer);

    let fetchDataFunction;
    switch (electionData.storageLayer.toLowerCase().trim()) {
      case "arweave":
        fetchDataFunction = fetchDataFromArweave;
        break;
      case "ipfs":
        fetchDataFunction = fetchDataFromIPFS;
        break;
      case "filecoin":
        fetchDataFunction = fetchDataFromFilecoin;
        break;
      default:
        console.error("Invalid storage layer:", electionData.storageLayer);

        return;
    }

    setLoading(true);

    fetchDataFunction(transactionId)
      .then((data) => {
        if (data) {
          const updatedData = {
            ...electionData,
            transactionId,
            daData: data,
          };
          setElectionData(updatedData);
          setStep(7);
        } else {
          throw new Error("Data not found for the provided transaction ID.");
        }
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "An error occurred while fetching data."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const generateAndDownloadJSON = (currentElectionData) => {
    const finalElectionData = { ...currentElectionData };

    delete finalElectionData.someComponent;
    delete finalElectionData.someEventObject;

    console.log("Final Election Data:", finalElectionData);

    downloadJSON(finalElectionData);
  };

  const downloadJSON = (finalElectionData) => {
    if (!finalElectionData) {
      console.error("finalElectionData is undefined or null");
      return;
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
          />
        )}
        {step === 5 && (
          <StepFive
            electionData={electionData}
            onPrevious={() => setStep(4)}
            onSubmit={handleStepFiveSubmit}
          />
        )}
        {step === 6 && (
          <StepSix
            electionData={electionData}
            onPrevious={() => setStep(5)}
            onSubmit={handleStepSixSubmit}
            onDownload={() => generateAndDownloadJSON(electionData)}
            isLoading={loading}
          />
        )}
        {step === 7 && (
          <StepSeven
            electionData={electionData}
            onPrevious={() => setStep(6)}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
