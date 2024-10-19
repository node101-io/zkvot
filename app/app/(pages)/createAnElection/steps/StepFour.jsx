"use client";

import React, { useState, useEffect, useContext } from "react";
import Button from "@/components/common/Button";
import CreateAppId from "@/components/CreateAppId";
import { SubwalletContext } from "@/contexts/SubwalletContext";

const StepFour = ({ electionData, onPrevious, onSubmit }) => {
  const [additionalInput, setAdditionalInput] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [appId, setAppId] = useState("");
  const [showCreateAppId, setShowCreateAppId] = useState(false);

  const { selectedAccount } = useContext(SubwalletContext);

  useEffect(() => {
    const communicationLayer = electionData.communication_layers[0];
    if (communicationLayer && communicationLayer.type === "avail") {
      setShowCreateAppId(true);
    }
  }, [electionData]);

  const handleInputChange = (e) => {
    setAdditionalInput(e.target.value);
    setIsSubmitEnabled(e.target.value.trim() !== "");
  };

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      onSubmit(additionalInput.trim());
    }
  };

  const handleAppIdGenerated = (newAppData) => {
    if (newAppData && newAppData.id) {
      const appId = newAppData.id.toString();
      setAppId(appId);
      setAdditionalInput(appId);
      setIsSubmitEnabled(true);
    } else {
      console.error("App ID not found in generated data");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-white text-2xl">Additional Input Required</h2>
      <div className="w-full bg-[#222222] p-4 rounded-lg text-white">
        <p className="mb-4">
          Please read the following explanation carefully. Afterward, provide
          the required input in the field below.
        </p>
        <p>For Avail, you need to create an App ID to proceed.</p>
      </div>
      {showCreateAppId && (
        <div className="w-full">
          <h3 className="text-white text-xl mb-4">Create App ID</h3>
          <CreateAppId onAppIdGenerated={handleAppIdGenerated} />
        </div>
      )}
      <div className="w-full">
        <label className="block text-white mb-2">
          Enter the required input:
        </label>
        <input
          type="text"
          value={additionalInput}
          onChange={handleInputChange}
          className={`w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border `}
          placeholder="Enter your App ID here"
          disabled={true}
        />
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={!isSubmitEnabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StepFour;
