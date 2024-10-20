"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import IPFSLogo from "@/assets/StorageLayers/IPFS.svg";
import FileCoinLogo from "@/assets/StorageLayers/FileCoin.svg";
import ArweaveLogo from "@/assets/StorageLayers/FileCoin.svg";
import Image from "next/image";

const storageLayersNames = [
  {
    name: "Arweave",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page.",
    fee: "0.0001",
    currency: "AR",
  },
  {
    name: "IPFS",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page.",
    fee: "0.0001",
    currency: "ETH",
  },
  {
    name: "Filecoin",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page.",
    fee: "0.0001",
    currency: "FIL",
  },
];

const StepFive = ({ electionData, onPrevious, onSubmit }) => {
  const [selectedStorageLayer, setSelectedStorageLayer] = useState(
    electionData.storageLayer || null
  );
  const handleNext = () => {
    if (selectedStorageLayer !== null) {
      onSubmit(storageLayersNames[selectedStorageLayer].name);
    }
  };

  const isSubmitEnabled = selectedStorageLayer !== null;

  const LayersLogos = {
    Arweave: (
      <Image
        src={ArweaveLogo}
        alt="Arweave Logo"
        width={160}
        height={160}
      />
    ),
    IPFS: (
      <Image
        src={IPFSLogo}
        alt="IPFS Logo"
        width={160}
        height={160}
      />
    ),
    Filecoin: (
      <Image
        src={FileCoinLogo}
        alt="Filecoin Logo"
        width={160}
        height={160}
      />
    ),
  };

  return (
    <div className="flex flex-col items-start space-y-6">
      <h2 className="text-white text-2xl">Choose a Storage Layer</h2>
      <div className="w-full">
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full`}>
          {storageLayersNames.map((storageLayer, index) => (
            <div
              key={index}
              className={`p-4 bg-[#222222] rounded-2xl cursor-pointer flex items-center transition duration-200 ${
                selectedStorageLayer === index
                  ? "border-[1px] border-primary shadow-lg"
                  : "hover:bg-[#333333]"
              }`}
              onClick={() => setSelectedStorageLayer(index)}
            >
              <div className="w-[160px] h-[160px] flex-shrink-0 rounded-[12px] mr-4 flex items-center justify-center">
                {LayersLogos[storageLayer.name] || (
                  <div className="w-full h-full bg-gray-500 rounded-[12px]" />
                )}
              </div>
              <div className="flex flex-col h-full justify-between">
                <h3 className="text-white text-[24px] mb-2">
                  {storageLayer.name}
                </h3>
                <p className="text-[16px] mb-2">{storageLayer.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[16px]">
                    Fee: {storageLayer.fee} {storageLayer.currency}
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
