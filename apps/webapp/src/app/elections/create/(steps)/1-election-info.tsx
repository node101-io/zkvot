import {
  useContext,
  useState,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";

import { types } from "zkvot-core";

import Button from "@/app/(partials)/button.jsx";

import DeleteIcon from "@/public/general/icons/delete.jsx";
import EditIcon from "@/public/general/icons/edit.jsx";
import PlusIcon from "@/public/general/icons/plus.jsx";

import formatDateForInput from "@/utils/formatDateForInput";
import { calculateSlotFromTimestamp } from "@/utils/o1js.js";

const ChoiceItem = ({
  index,
  choice,
  choices,
  setChoices,
}: {
  index: number;
  choice: string;
  choices: string[];
  setChoices: (choices: string[]) => void;
}) => {
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

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEdit();
    }
  };

  return (
    <div className="w-full min-h-12 h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedChoice}
            onChange={(event) => setEditedChoice(event.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 h-8 p-2 bg-[#222] text-white rounded-[73px] outline-none"
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
            <DeleteIcon size={24} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate">{choice}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <EditIcon />
          </button>
          <button
            onClick={deleteChoice}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <DeleteIcon size={20} />
          </button>
        </>
      )}
    </div>
  );
};

const ChoiceInput = ({
  choices,
  setChoices,
}: {
  choices: string[];
  setChoices: (choices: string[]) => void;
}) => {
  const [newChoice, setNewChoice] = useState("");

  const addChoice = () => {
    if (newChoice.trim()) {
      setChoices([...choices, newChoice.trim()]);
      setNewChoice("");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addChoice();
    }
  };

  return (
    <div className="flex items-center space-x-2 w-full">
      <input
        type="text"
        placeholder="Add Choices"
        value={newChoice}
        onChange={(event) => setNewChoice(event.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-1 h-12 px-4 bg-[#222] text-white rounded-[73px] outline-none"
      />
      <button
        onClick={addChoice}
        className="w-12 h-12 bg-[#222] text-white rounded-[23px] flex items-center justify-center"
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default ({
  onNext,
  initialData,
}: {
  onNext: (data: types.ElectionStaticData) => void;
  initialData: types.ElectionStaticData;
}) => {
  const [pictureDataURL, setPictureDataURL] = useState<string>(
    initialData.image_raw || ""
  );
  const [question, setQuestion] = useState<string>(initialData?.question || "");
  const [choices, setChoices] = useState<string[]>(initialData?.options || []);
  const [description, setDescription] = useState<string>(
    initialData.description || ""
  );

  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    return isNaN(date.getTime()) ? new Date() : date;
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    return isNaN(date.getTime()) ? new Date() : date;
  });

  const [isNextEnabled, setIsNextEnabled] = useState(false);

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

  const handlePictureChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureDataURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (isNextEnabled) {
      const { startSlot, endSlot } = await calculateSlotFromTimestamp(startDate, endDate)

      onNext({
        ...initialData,
        start_slot: startSlot,
        end_slot: endSlot,
        question,
        options: choices,
        description,
        image_raw: pictureDataURL,
      });
    }
  };

  return (
    <div className="flex relative flex-col min-h-[calc(100vh-160px)] max-h-[calc(100vh-162px)] p-4 space-y-4">
      <div className="flex flex-col space-y-6 w-full mx-auto">
        <div className="flex space-x-6 items-start">
          <label
            className="flex justify-center items-center w-64 h-40 cursor-pointer relative border-2 border-dashed border-gray-600 rounded-[23px] overflow-hidden"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='40' ry='40' stroke='%23D4A6C4FF' strokeWidth='5' stroke-dasharray='2%2c24' stroke-dashoffset='56' strokeLinecap='round'/%3e%3c/svg%3e')",
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

          <div className="flex flex-col flex-grow">
            <div className="mb-4">
              <label className="text-white text-sm">Question</label>
              <input
                type="text"
                placeholder="Write your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-[#222] text-white rounded-[73px] outline-none"
              />
            </div>

            <div className="flex space-x-4 ">
              <div className="flex-1">
                <label className="text-white text-sm">Start Date</label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(startDate)}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setStartDate(newDate);
                    }
                  }}
                  style={{ colorScheme: "dark" }}
                  className="w-full mt-2 px-4 py-2 bg-[#222] text-white rounded-[73px] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-white text-sm">End Date</label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(endDate)}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setEndDate(newDate);
                    }
                  }}
                  style={{ colorScheme: "dark" }}
                  className="w-full mt-2 px-4 py-2 bg-[#222] text-white rounded-[73px] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto">
        <h3 className="text-white text-sm mb-2">Add Options</h3>
        <ChoiceInput
          choices={choices}
          setChoices={setChoices}
        />
      </div>

      <div className="w-full mx-auto">
        <div className="space-y-2  min-w-xl max-w-xl">
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

      <div className="w-full mx-auto">
        <label className="text-white text-sm">Description</label>
        <textarea
          placeholder="Write your description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-48 mt-2 px-4 py-3 bg-[#222] text-white rounded-[23px] outline-none resize-none"
        />
      </div>

      <div className="absolute right-4 bottom-4">
        <Button
          onClick={handleNext}
          className={!isNextEnabled ? "opacity-50 cursor-not-allowed" : ""}
          disabled={!isNextEnabled}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
