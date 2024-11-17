"use client";

import React, { useState, useEffect } from "react";

import Button from "@/app/(partials)/Button";
import { useToast } from "@/app/(partials)/ToastProvider";

import CreateAppId from "../(partials)/CreateAppId";

import {
  fetchAvailBlockHeight,
  fetchCelestiaBlockInfo,
} from "@/contexts/FetchLatestBlock";

export default ({
  electionData,
  blockHeight,
  blockHash,
  onPrevious,
  onSubmit,
  onUpdateElectionData,
}) => {
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [appId, setAppId] = useState("");
  const [showCreateAppId, setShowCreateAppId] = useState(false);
  const [showFetchButton, setShowFetchButton] = useState(false);
  const [localBlockHeight, setLocalBlockHeight] = useState(blockHeight);
  const [localBlockHash, setLocalBlockHash] = useState(blockHash);

  const toast = useToast();

  useEffect(() => {
    const communicationLayer = electionData.communication_layers[0];
    if (communicationLayer) {
      if (communicationLayer.type === "avail") {
        setShowCreateAppId(true);

        if (localBlockHeight) {
          setIsSubmitEnabled(!!appId);
        } else {
          const timer = setTimeout(() => {
            if (!localBlockHeight) {
              setShowFetchButton(true);
            }
          }, 3000);

          return () => clearTimeout(timer);
        }
      } else if (communicationLayer.type === "celestia") {
        if (localBlockHeight && localBlockHash) {
          setIsSubmitEnabled(true);
        } else {
          const timer = setTimeout(() => {
            if (!localBlockHeight || !localBlockHash) {
              setShowFetchButton(true);
            }
          }, 3000);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [electionData, localBlockHeight, localBlockHash, appId]);

  const fetchCelestiaBlockDataInStepFour = async () => {
    try {
      const data = await fetchCelestiaBlockInfo();
      setLocalBlockHeight(data.blockHeight);
      setLocalBlockHash(data.blockHash);
      setIsSubmitEnabled(true);
      setShowFetchButton(false);

      onUpdateElectionData((prevData) => {
        const updatedData = { ...prevData };
        if (updatedData.communication_layers[0]) {
          updatedData.communication_layers[0].block_height = data.blockHeight;
          updatedData.communication_layers[0].block_hash = data.blockHash;
        }
        return updatedData;
      });
    } catch (error) {
      console.error("Error fetching Celestia block data in StepFour:", error);
    }
  };

  const fetchAvailBlockHeightInStepFour = async () => {
    try {
      const height = await fetchAvailBlockHeight();
      setLocalBlockHeight(height);
      setIsSubmitEnabled(!!appId);
      setShowFetchButton(false);

      onUpdateElectionData((prevData) => {
        const updatedData = { ...prevData };
        if (updatedData.communication_layers[0]) {
          updatedData.communication_layers[0].block_height = height;
        }
        return updatedData;
      });
    } catch (error) {
      console.error("Error fetching Avail block height in StepFour:", error);
    }
  };

  const handleSubmit = () => {
    const communicationLayer = electionData.communication_layers[0];

    if (communicationLayer.type === "avail") {
      const updatedData = {
        app_id: appId,
        block_height: localBlockHeight,
      };
      onSubmit(updatedData);
    } else if (communicationLayer.type === "celestia") {
      const updatedData = {
        block_height: localBlockHeight,
        block_hash: localBlockHash,
      };
      onSubmit(updatedData);
    }
  };

  const handleAppIdGenerated = (newAppData) => {
    if (newAppData && newAppData.id) {
      const generatedAppId = newAppData.id.toString();
      setAppId(generatedAppId);
      showToast("App ID generated successfully", "success");

      if (localBlockHeight) {
        setIsSubmitEnabled(true);
      }
    } else {
      console.error("App ID not found in generated data");
    }
  };

  return (
    <div className="flex flex-col justify-between items-center space-y-6 h-[calc(100vh-215px)] overflow-y-auto p-4">
      {electionData.communication_layers[0]?.type === "avail" && (
        <div className="w-full">
          <div className="w-full pb-6">
            <CreateAppId onAppIdGenerated={handleAppIdGenerated} />
          </div>

          <label className="block text-white">App ID:</label>
          <input
            type="text"
            value={appId}
            readOnly
            className="w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4"
          />
          {!localBlockHeight && showFetchButton && (
            <div className="py-2">
              <button
                onClick={fetchAvailBlockHeightInStepFour}
                className="px-4 rounded-full py-2 bg-transparent text-white border hover:bg-gray-700 transition-colors duration-300"
              >
                Fetch Block Height
              </button>
            </div>
          )}
          {localBlockHeight && (
            <>
              <label className="block text-white my-2">Block Height:</label>
              <input
                type="text"
                value={localBlockHeight}
                readOnly
                className="w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4"
              />
            </>
          )}
        </div>
      )}
      {electionData.communication_layers[0]?.type === "celestia" && (
        <>
          {!localBlockHeight && !localBlockHash && showFetchButton && (
            <div className="py-2">
              <button
                onClick={fetchCelestiaBlockDataInStepFour}
                className="px-4 rounded-full py-2 bg-transparent text-white border hover:bg-gray-700 transition-colors duration-300"
              >
                Fetch Block Data
              </button>
            </div>
          )}
          {localBlockHeight && localBlockHash && (
            <>
              <div className="w-full space-y-12">
                <div className="w-full">
                  <label className="block text-white mb-2">Block Height:</label>
                  <input
                    type="text"
                    value={localBlockHeight}
                    readOnly
                    className="w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-white mb-2">Block Hash:</label>
                  <input
                    type="text"
                    value={localBlockHash}
                    readOnly
                    className="w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border"
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
      <div className="w-full flex justify-between pt-4">
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
