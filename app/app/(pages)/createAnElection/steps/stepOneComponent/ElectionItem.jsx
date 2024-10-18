import React, { useState } from "react";
import DeleteIcon from "@/assets/CreateElection/DeleteIcon.svg";
import EditIcon from "@/assets/CreateElection/EditIcon.svg";
import Image from "next/image";

const ElectionItem = ({ index, election, elections, setElections }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedElection, setEditedElection] = useState(election);

  const saveEdit = () => {
    if (editedElection.trim()) {
      const updatedElections = [...elections];
      updatedElections[index] = editedElection.trim();
      setElections(updatedElections);
      setIsEditing(false);
    }
  };

  const deleteElection = () => {
    const updatedElections = elections.filter((_, i) => i !== index);
    setElections(updatedElections);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  return (
    <div className="w-[620px] h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px] border border-[#1E1E1E]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedElection}
            onChange={(e) => setEditedElection(e.target.value)}
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
          <span className="flex-1">{election}</span>
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
            onClick={deleteElection}
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

export default ElectionItem;
