import React, { useState } from "react";
import Button from "@/components/common/Button";

const StepFour = ({ onPrevious, onSubmit }) => {
  const [additionalInput, setAdditionalInput] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const handleInputChange = (e) => {
    setAdditionalInput(e.target.value);
    setIsSubmitEnabled(e.target.value.trim() !== "");
  };

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      onSubmit(additionalInput.trim());
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-white text-2xl">Explanation and Additional Input</h2>
      <div className="w-full bg-[#222222] p-4 rounded-lg text-white">
        <p className="mb-4">
          Please read the following explanation carefully. Afterward, provide
          the required input in the field below.
        </p>
        <p>
          For example, you might need to provide a code or value obtained from
          the explanation above.
        </p>
      </div>
      <div className="w-full">
        <label className="block text-white mb-2">
          Enter the required input:
        </label>
        <input
          type="text"
          value={additionalInput}
          onChange={handleInputChange}
          className={`w-[578px] h-12 p-2 bg-[#222] text-white rounded-[23px] border `}
          placeholder="Enter your input here"
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
