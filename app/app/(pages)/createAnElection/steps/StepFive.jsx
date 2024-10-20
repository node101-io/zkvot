"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";

const StepFive = ({ electionData, onPrevious, onSubmit }) => {
  const [selectedStorageLayer, setSelectedStorageLayer] = useState(
    electionData.storageLayer || ""
  );

  const handleStorageLayerChange = (e) => {
    setSelectedStorageLayer(e.target.value);
  };

  const handleNext = () => {
    onSubmit(selectedStorageLayer);
  };

  const isSubmitEnabled = selectedStorageLayer !== "";

  return (
    <div className="flex flex-col items-start space-y-6">
      <h2 className="text-white text-2xl">Select a Data Availability Layer</h2>
      <div className="w-full">
        <label className="block text-white mb-2">Choose a Storage Layer:</label>
        <select
          value={selectedStorageLayer}
          onChange={handleStorageLayerChange}
          className="w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border"
        >
          <option
            value=""
            disabled
          >
            Select a Storage Layer
          </option>
          <option value="arweave">Arweave</option>
          <option value="ipfs">IPFS</option>
          <option value="filecoin">Filecoin</option>
        </select>
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleNext}
          disabled={!isSubmitEnabled}
          className={!isSubmitEnabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepFive;
