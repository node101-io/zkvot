"use client";

import React, { useState, useEffect } from "react";
import AvailLogo from "../../../../assets/DaLogos/Avail";
import CelestiaLogo from "../../../../assets/DaLogos/Celestia";
import Button from "../../../../components/common/Button";

const CreationData = {
  CommunicationChoicesName: ["Avail", "Celestia"],
  CommunicationChoicesDescription: [
    "Avail is a decentralized data availability layer.",
    "Celestia is a modular consensus and data network.",
  ],
  CommunicationChoicesFee: [0.1, 0.2],
  CommunicationChoicesCurrency: ["ETH", "ETH"],
};

const StepThree = ({ onPrevious, onSubmit, loading }) => {
  const communicationLogos = {
    Avail: <AvailLogo className="w-12 h-12" />,
    Celestia: <CelestiaLogo className="w-12 h-12" />,
  };

  const [selectedCommunicationLayer, setSelectedCommunicationLayer] =
    useState(null);

  useEffect(() => {
    setSelectedCommunicationLayer(null);
  }, []);

  const handleCommunicationSelection = (index) => {
    setSelectedCommunicationLayer(index);
  };

  const handleSubmit = () => {
    if (selectedCommunicationLayer === null) return;

    const selectedName =
      CreationData.CommunicationChoicesName[selectedCommunicationLayer];
    let communicationLayer = {
      type: selectedName.toLowerCase(),
    };

    onSubmit([communicationLayer]);
  };

  return (
    <div className="flex flex-col justify-between items-center h-[calc(100vh-215px)] overflow-y-auto p-4">
      <div className="w-full space-y-6 p">
        <h2 className="text-white text-2xl">Select Communication Layer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {CreationData.CommunicationChoicesName.map((layer, index) => (
            <div
              key={index}
              className={`p-4 bg-[#222222] rounded-2xl flex items-center transition duration-200 cursor-pointer ${
                selectedCommunicationLayer === index
                  ? "border-[1px] border-primary shadow-lg"
                  : "hover:bg-[#333333]"
              }`}
              onClick={() => handleCommunicationSelection(index)}
            >
              <div className="flex-shrink-0 mr-4">
                {communicationLogos[layer] || (
                  <div className="w-12 h-12 bg-gray-500 rounded-full" />
                )}
              </div>
              <div className="flex flex-col h-full justify-between">
                <h3 className="text-white text-[24px] mb-2">{layer}</h3>
                <p className="text-[16px] mb-2">
                  {CreationData.CommunicationChoicesDescription[index]}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[16px]">
                    Fee: {CreationData.CommunicationChoicesFee[index]}{" "}
                    {CreationData.CommunicationChoicesCurrency[index]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedCommunicationLayer === null}
          className={
            selectedCommunicationLayer === null
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
          loading={loading}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
