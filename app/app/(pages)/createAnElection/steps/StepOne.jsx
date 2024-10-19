"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import ElectionInput from "./stepOneComponent/ElectionInput";
import ElectionList from "./stepOneComponent/ElectionList";

const StepOne = ({ onNext, initialData }) => {
  const [pictureDataURL, setPictureDataURL] = useState(
    initialData?.picture || ""
  );
  const [question, setQuestion] = useState(initialData?.question || "");
  const [elections, setElections] = useState(initialData?.options || []);
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureDataURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (
      pictureDataURL &&
      question.trim() &&
      elections.length >= 2 &&
      startDate &&
      endDate
    ) {
      setIsNextEnabled(true);
    } else {
      setIsNextEnabled(false);
    }
  }, [pictureDataURL, question, elections, startDate, endDate]);

  const handleSubmit = () => {
    if (isNextEnabled) {
      const data = {
        picture: pictureDataURL,
        question,
        options: elections,
        description,
        start_date: parseInt(startDate),
        end_date: parseInt(endDate),
      };
      onNext(data);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6 bg-[#121315] rounded-lg w-full max-w-4xl">
      <div className="flex space-x-[48px]">
        <label
          className="flex justify-center items-center w-64 h-40 cursor-pointer relative"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='40' ry='40' stroke='%23D4A6C4FF' strokeWidth='5' stroke-dasharray='2%2c 24' stroke-dashoffset='56' strokeLinecap='round'/%3e%3c/svg%3e\")",
            borderRadius: "40px",
            backgroundColor: "#222222",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
          />
          {pictureDataURL ? (
            <img
              src={pictureDataURL}
              alt="Selected"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400 z-0">Add Picture</span>
          )}
        </label>

        <div className="flex flex-col space-y-4 flex-grow">
          <div className="flex flex-col space-y-2">
            <p className="text-[14px]">Question</p>
            <input
              type="text"
              placeholder="Please write down your title"
              className="p-2 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E] w-full"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
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

      <div className="flex flex-col text-[14px] space-y-4 w-full pt-[50px]">
        <h3 className="text-white">Add Options</h3>
        <ElectionInput
          elections={elections}
          setElections={setElections}
        />
        <ElectionList
          elections={elections}
          setElections={setElections}
        />
      </div>
      <div className="flex flex-col space-y-2 text-[14px]">
        <p>Description</p>
        <textarea
          placeholder="Please write down your description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-4 bg-[#222] text-white rounded-[40px] border border-[#1E1E1E] w-full"
        />
      </div>

      <div className="w-full flex justify-end items-center pt-6">
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
    </div>
  );
};

export default StepOne;
