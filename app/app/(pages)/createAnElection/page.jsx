"use client";
import React, { useState } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import StepFour from "./steps/StepFour";
import StepFive from "./steps/StepFive";
import StepSix from "./steps/StepSix";
// import StepSeven from "./steps/StepSeven";

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

  const handleStepSixSubmit = (transactionId) => {
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
        return Promise.reject("Invalid storage layer");
    }

    if (typeof fetchDataFunction !== "function") {
      console.error("fetchDataFunction is not a function:", fetchDataFunction);

      return Promise.reject("fetchDataFunction is not a function");
    }

    return fetchDataFunction(transactionId)
      .then((data) => {
        if (data) {
          console.log("Fetched data:", data);

          const updatedData = {
            ...electionData,
            transactionId,
            daData: data,
          };
          setElectionData(updatedData);

          return sendTransaction();
        } else {
          console.error("Error fetching data from storage layer");
        }
      })
      .then((transactionResult) => {
        console.log(transactionResult);
        alert("Transaction sent successfully.");
        setStep(7);
      })
      .catch((error) => {
        console.error("Error during Step Six submission:", error);
        alert(error.message || "The data is not submitted correctly.");
        throw error;
      });
  };

  const generateAndDownloadJSON = (currentElectionData) => {
    const finalElectionData = { ...currentElectionData };

    delete finalElectionData.storageLayer;
    delete finalElectionData.transactionId;
    delete finalElectionData.daData;

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

  // const sendTransaction = () => {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       resolve("Transaction successful");
  //     }, 2000);
  //   });
  // };

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
          />
        )}
        {/* {step === 7 && (
          <StepSeven
            electionData={electionData}
            onPrevious={() => setStep(6)}
          />
        )} */}
      </div>
    </div>
  );
};

export default HomePage;
