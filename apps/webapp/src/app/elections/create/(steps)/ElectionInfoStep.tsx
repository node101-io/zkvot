"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import Button from "@/app/(partials)/Button";

import EditIcon from "@/public/CreateElection/EditIcon.svg";
import DeleteIcon from "@/public/CreateElection/DeleteIcon.svg";
import PlusIcon from "@/public/CreateElection/PlusIcon.svg";

const ChoiceItem = ({ index, choice, choices, setChoices }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChoice, setEditedChoice] = useState(choice);

  const saveEdit = () => {
    if (editedChoice.trim()) {
      const updatedChoices = [...choices];
      updatedChoices[index] = editedChoice.trim();
      setChoices(updatedChoices);
      setIsEditing(false);
    }
  };

  const deleteChoice = () => {
    const updatedChoices = choices.filter((_, i) => i !== index);
    setChoices(updatedChoices);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  return (
    <div className="w-[620px] min-h-12 h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px] border border-[#1E1E1E]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedChoice}
            onChange={(e) => setEditedChoice(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-8 p-1 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E]"
          />
          <button
            onClick={saveEdit}
            className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center ml-2"
          >
            ✓
          </button>

          <button
            onClick={() => setIsEditing(false)}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <Image
              src={DeleteIcon}
              alt="Edit"
              width={24}
              height={24}
            />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1">{choice}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <Image
              src={EditIcon}
              alt="Edit"
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={deleteChoice}
            className=" rounded-full flex items-center justify-center mx-1"
          >
            <Image
              src={DeleteIcon}
              alt="Delete"
              width={20}
              height={20}
            />
          </button>
        </>
      )}
    </div>
  );
};
const ChoiceInput = ({ choices, setChoices }) => {
  const [newChoice, setNewChoice] = useState("");

  const addChoice = () => {
    if (newChoice.trim()) {
      setChoices([...choices, newChoice.trim()]);
      setNewChoice("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChoice();
    }
  };

  return (
    <div className="flex items-center space-x-2 w-full">
      <input
        type="text"
        placeholder="Add Choices"
        value={newChoice}
        onChange={(e) => setNewChoice(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 h-12 p-2 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E]"
      />
      <button
        onClick={addChoice}
        className="w-12 h-12 bg-[#222] text-white rounded-[23px] border border-[#1E1E1E] flex items-center justify-center"
      >
        <Image
          width={20}
          height={20}
          src={PlusIcon}
          alt="Plus Icon"
        />
      </button>
    </div>
  );
};

export default ({ onNext, initialData }) => {
  const formatDateTimeLocal = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toISOString().slice(0, 16);
  };

  const [pictureDataURL, setPictureDataURL] = useState(
    initialData?.image_raw || ""
  );
  const [question, setQuestion] = useState(initialData?.question || "");
  const [choices, setChoices] = useState(initialData?.options || []);
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
      choices.length >= 2 &&
      startDate &&
      endDate
    ) {
      setIsNextEnabled(true);
    } else {
      setIsNextEnabled(false);
    }
  }, [pictureDataURL, question, choices, startDate, endDate]);

  const handleSubmit = () => {
    if (isNextEnabled) {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      const data = {
        question,
        options: choices,
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
            <ChoiceInput
              choices={choices}
              setChoices={setChoices}
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto mb-4">
          <div className="w-full flex flex-col space-y-2 items-start  overflow-y-scroll">
            {choices.map((choice, index) => (
              <ChoiceItem
                key={index}
                index={index}
                choice={choice}
                choices={choices}
                setChoices={setChoices}
              />
            ))}
          </div>
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
