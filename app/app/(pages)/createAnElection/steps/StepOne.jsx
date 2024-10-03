import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import ElectionInput from "./stepOneComponent/ElectionInput";
import ElectionList from "./stepOneComponent/ElectionList";

const StepOne = ({ onNext, initialData }) => {
  const [picture, setPicture] = useState(initialData?.picture || null);
  const [question, setQuestion] = useState(initialData?.question || "");
  const [elections, setElections] = useState(initialData?.elections || []);
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPicture(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (
      picture &&
      question.trim() &&
      elections.length >= 2 &&
      startDate &&
      endDate
    ) {
      setIsNextEnabled(true);
    } else {
      setIsNextEnabled(false);
    }
  }, [picture, question, elections, startDate, endDate]);

  const handleSubmit = () => {
    if (isNextEnabled) {
      const data = {
        picture,
        question,
        elections,
        description,
        startDate,
        endDate,
      };
      onNext(data);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6 bg-[#121315] rounded-lg w-full max-w-4xl">
      <div className="flex space-x-6">
        <label className="flex justify-center items-center w-64 h-40 bg-gray-700 rounded-lg cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
          />
          {picture ? (
            <img
              src={URL.createObjectURL(picture)}
              alt="Selected"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400 z-0">Add Picture</span>
          )}
        </label>

        <div className="flex flex-col space-y-4 flex-grow">
          <input
            type="text"
            placeholder="Please write down your title"
            className="p-2 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E] w-full"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="flex space-x-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E] w-full"
            />
            <span className="text-white self-center">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E] w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4 w-full">
        <h3 className="text-white">Add Choices</h3>
        <ElectionInput
          elections={elections}
          setElections={setElections}
        />
        <ElectionList
          elections={elections}
          setElections={setElections}
        />
      </div>

      <textarea
        placeholder="Please write down your description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 bg-[#222] text-white rounded border border-[#1E1E1E] w-full"
      />

      <Button
        onClick={handleSubmit}
        className={`mt-4 ${
          !isNextEnabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!isNextEnabled}
      >
        Next
      </Button>
    </div>
  );
};

export default StepOne;
