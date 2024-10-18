import React, { useState } from "react";
import AvailLogo from "@/assets/DaLogos/Avail";
import CelestiaLogo from "@/assets/DaLogos/Celestia";
import Button from "@/components/common/Button";

const CreationData = {
  DAChoicesName: ["Avail", "Celestia"],
  DAChoicesDescription: [
    "Avail is a decentralized data availability layer.",
    "Celestia is a modular consensus and data network.",
  ],
  DAChoicesFee: [0.1, 0.2],
  DAChoicesCurrency: ["ETH", "ETH"],
};

const StepThree = ({ onPrevious, onSubmit }) => {
  const daLogos = {
    Avail: <AvailLogo className="w-12 h-12" />,
    Celestia: <CelestiaLogo className="w-12 h-12" />,
  };

  const [selectedDA, setSelectedDA] = useState(null);
  const [communicationLayersData, setCommunicationLayersData] = useState([]);

  const handleDASelection = (index) => {
    setSelectedDA(index);
  };

  const handleSubmit = () => {
    const selectedDAName = CreationData.DAChoicesName[selectedDA];
    let communicationLayer = {
      type: selectedDAName.toLowerCase(),
      start_date: 1000,
    };

    if (selectedDAName === "Celestia") {
      communicationLayer.namespace = "namespace_value";
    } else if (selectedDAName === "Avail") {
      communicationLayer.app_id = "17";
    }

    onSubmit([communicationLayer]);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-white text-2xl">Select Communication Layer</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {CreationData.DAChoicesName.map((DA, index) => (
          <div
            key={index}
            className={`p-4 bg-[#222222] rounded-2xl flex items-center transition duration-200 cursor-pointer ${
              selectedDA === index
                ? "border-[1px] border-primary shadow-lg"
                : "hover:bg-[#333333]"
            }`}
            onClick={() => handleDASelection(index)}
          >
            <div className="flex-shrink-0 mr-4">
              {daLogos[DA] || (
                <div className="w-12 h-12 bg-gray-500 rounded-full" />
              )}
            </div>
            <div className="flex flex-col h-full justify-between">
              <h3 className="text-white text-[24px] mb-2">{DA}</h3>
              <p className="text-[16px] mb-2">
                {CreationData.DAChoicesDescription[index]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[16px]">
                  Fee: {CreationData.DAChoicesFee[index]}{" "}
                  {CreationData.DAChoicesCurrency[index]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedDA === null}
          className={selectedDA === null ? "opacity-50 cursor-not-allowed" : ""}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
