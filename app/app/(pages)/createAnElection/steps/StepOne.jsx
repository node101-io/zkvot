"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import ElectionInput from "./stepOneComponent/ElectionInput";
import ElectionList from "./stepOneComponent/ElectionList";

const StepOne = ({ onNext, initialData }) => {
  const formatDateTimeLocal = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toISOString().slice(0, 16);
  };

  const [pictureDataURL, setPictureDataURL] = useState(
    initialData?.image_raw || ""
  );
  const [question, setQuestion] = useState(initialData?.question || "");
  const [elections, setElections] = useState(initialData?.options || []);
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(
    formatDateTimeLocal(initialData?.start_date)
  );
  const [endDate, setEndDate] = useState(
    formatDateTimeLocal(initialData?.end_date)
  );
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
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      const data = {
        question,
        options: elections,
        description,
        start_date: startTimestamp,
        end_date: endTimestamp,
        image_raw: pictureDataURL,
      };
      onNext(data);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-215px)] p-4 justify-between">
      <div>
        <div className="flex flex-col space-y-6 p-6 bg-[#121315] rounded-lg w-full max-w-4xl mb-4">
          <div className="flex space-x-12">
            <label
              className="flex justify-center items-center w-64 h-40 cursor-pointer relative"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='40' ry='40' stroke='%23D4A6C4FF' strokeWidth='5' stroke-dasharray='2%2c24' stroke-dashoffset='56' strokeLinecap='round'/%3e%3c/svg%3e\")",
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
              {/* Question Input */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-white">Question</p>
                <input
                  type="text"
                  placeholder="Please write down your title"
                  className="p-2 bg-[#222] text-white rounded-full border border-[#1E1E1E] w-full"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex flex-col space-y-2 w-full">
                  <p className="text-sm text-white">Start Date</p>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 bg-[#222] text-white rounded-full border border-[#1E1E1E] w-full"
                  />
                </div>

                <div className="flex flex-col space-y-2 w-full">
                  <p className="text-sm text-white">End Date</p>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 bg-[#222] text-white rounded-full border border-[#1E1E1E] w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-sm space-y-4 w-full pt-12">
            <h3 className="text-white">Add Options</h3>
            <ElectionInput
              elections={elections}
              setElections={setElections}
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto mb-4">
          <ElectionList
            elections={elections}
            setElections={setElections}
          />
        </div>

        <div className="flex flex-col space-y-2 text-sm mb-[28px]">
          <p className="text-white">Description</p>
          <textarea
            placeholder="Please write down your description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-4 bg-[#222] text-white rounded-2xl border border-[#1E1E1E] w-full resize-none"
          />
        </div>
      </div>

      <div className="w-full flex justify-end items-center">
        <Button
          onClick={handleSubmit}
          className={`${!isNextEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isNextEnabled}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepOne;
