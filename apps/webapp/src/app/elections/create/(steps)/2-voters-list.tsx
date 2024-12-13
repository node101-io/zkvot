import { useState, KeyboardEvent } from "react";
import { PublicKey } from "o1js";
import ChevronDownIcon from "@heroicons/react/solid/ChevronDownIcon.js";

import { types, utils } from "zkvot-core";

import Button from "@/app/(partials)/button.jsx";

import DeleteIcon from "@/public/general/icons/delete.jsx";
import EditIcon from "@/public/general/icons/edit.jsx";
import PlusIcon from "@/public/general/icons/plus.jsx";

const VoterItem = ({
  index,
  voterData,
  voters,
  setVoters,
  requiredFields = [],
  customOptionNames = {},
}: {
  index: number;
  voterData: types.Voter;
  voters: types.Voter[];
  setVoters: (voters: types.Voter[]) => void;
  requiredFields: string[];
  customOptionNames: types.VoterCustomFields;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [publicKey, setPublicKey] = useState(voterData.public_key);
  const [optionalFields, setOptionalFields] = useState(() => {
    const fields: types.VoterCustomFields = {};

    requiredFields.forEach((field) => {
      let key;

      if (field === "Twitter Handle") {
        key = "twitter";
      } else {
        key =
          customOptionNames[field]?.replace(" ", "_").toLowerCase() ||
          field.replace(" ", "_").toLowerCase();
      }

      fields[field] = voterData[key] || "";
    });

    return fields;
  });

  const [inputError, setInputError] = useState<{ [key: string]: boolean }>({});

  const saveEdit = () => {
    let errors: { [key: string]: boolean } = {};
    let hasError = false;

    if (!publicKey.trim()) {
      errors.publicKey = true;
      hasError = true;
    }

    requiredFields.forEach((field) => {
      if (!optionalFields[field]?.trim()) {
        errors[field] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setInputError(errors);
      return;
    }

    const updatedVoterData: types.Voter = { public_key: publicKey.trim() };

    requiredFields.forEach((field) => {
      const key = field.replace(" ", "_").toLowerCase();

      updatedVoterData[key] = optionalFields[field].trim();
    });

    const updatedVoters = [...voters];
    updatedVoters[index] = updatedVoterData;
    console.log(updatedVoters);
    setVoters(updatedVoters);
    setIsEditing(false);
    setInputError({});
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setPublicKey(voterData.publicKey);
    setOptionalFields(() => {
      const fields: types.VoterCustomFields = {};
      requiredFields.forEach((field) => {
        const key = field.replace(" ", "_").toLowerCase();
        fields[field] = voterData[key] || "";
      });
      return fields;
    });
    setInputError({});
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveEdit();
    }
  };

  const deleteVoter = () => {
    const updatedVoters = voters.filter((_, i) => i !== index);

    setVoters(updatedVoters);

    if (index === 0 && updatedVoters.length > 0) {
      const newFirstVoter = updatedVoters[0];
      const newRequiredFields = requiredFields.filter((field) => {
        const key = field.replace(" ", "_").toLowerCase();
        return newFirstVoter[key];
      });
    }
  };

  return (
    <div className="w-[740px] max-h-12 min-h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px] border border-[#1E1E1E]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`flex-1 h-8 p-1 bg-[#222] text-white rounded-[73px] border ${
              inputError.publicKey ? "border-red-500" : "border-[#1E1E1E]"
            } mr-2`}
          />

          {requiredFields.map((field) => {
            const displayName =
              field === "Twitter Handle"
                ? field
                : customOptionNames[field] || field;
            return (
              <div
                key={field}
                className="flex items-center "
              >
                {field === "Twitter Handle" && (
                  <span className="text-white mr-1">@</span>
                )}
                <input
                  type="text"
                  placeholder={displayName}
                  value={optionalFields[field]}
                  onChange={(e) =>
                    setOptionalFields((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  onKeyDown={handleKeyPress}
                  className={`w-[130px] max-w-[150px] overflow-x-scroll h-8 p-1 bg-[#222222] text-white rounded-[73px] border ${
                    inputError[field] ? "border-red-500" : "border-[#1E1E1E]"
                  }`}
                />
              </div>
            );
          })}

          <button
            onClick={saveEdit}
            className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center ml-2"
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <DeleteIcon size={20} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-[#B7B7B7] text-[14px]  overflow-x-scroll">
            {voterData.public_key}
          </span>{" "}
          {requiredFields.map((field) => {
            let key;
            if (field === "Twitter Handle") {
              key = "twitter";
            } else {
              key =
                customOptionNames[field]?.replace(" ", "_").toLowerCase() ||
                field.replace(" ", "_").toLowerCase();
            }
            const displayName =
              field === "Twitter Handle"
                ? field
                : customOptionNames[field] || field;
            return (
              voterData[key] && (
                <div
                  key={field}
                  className="flex items-center px-2 py-1 bg-[#222222] rounded-full mx-2 text-[#B7B7B7] text-[14px]  max-w-[150px] overflow-x-scroll"
                >
                  <span className="text-nowrap">
                    {field === "Twitter Handle"
                      ? `@${voterData[key]}`
                      : `${displayName}: ${voterData[key]}`}
                  </span>
                </div>
              )
            );
          })}
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <EditIcon />
          </button>
          <button
            onClick={deleteVoter}
            className="rounded-full flex items-center justify-center mx-1"
          >
            <DeleteIcon size={20} />
          </button>
        </>
      )}
    </div>
  );
};

const VoterInput = ({
  voters,
  setVoters,
  requiredFields,
  setCustomOptionNamesInParent,
  setRequiredFields,
}: {
  voters: types.Voter[];
  setVoters: (voters: types.Voter[]) => void;
  requiredFields: string[];
  setRequiredFields: (fields: string[]) => void;
  setCustomOptionNamesInParent: (names: types.VoterCustomFields) => void;
}) => {
  const [publicKey, setPublicKey] = useState("");
  const [optionalFields, setOptionalFields] = useState<types.VoterCustomFields>(
    {}
  );
  const [selectedOptionalFields, setSelectedOptionalFields] = useState<
    string[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputError, setInputError] = useState<{ [key: string]: boolean }>({});
  const [shake, setShake] = useState(false);
  const [customOptionNames, setCustomOptionNames] =
    useState<types.VoterCustomFields>({});
  const [newCustomOption, setNewCustomOption] = useState("");

  const isFirstVoter = voters.length === 0;

  const addVoter = () => {
    let errors: { [key: string]: boolean } = {};
    let hasError = false;

    if (!publicKey.trim() || !utils.isPublicKeyValid(publicKey.trim())) {
      errors.publicKey = true;
      hasError = true;
    }

    const fieldsToValidate = isFirstVoter
      ? selectedOptionalFields
      : requiredFields;

    fieldsToValidate.forEach((field) => {
      if (!optionalFields[field]?.trim()) {
        errors[field] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setInputError(errors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const voterData: types.Voter = { public_key: publicKey.trim() };

    fieldsToValidate.forEach((field) => {
      let key;
      if (field === "Twitter Handle") {
        key = "twitter";
      } else {
        key =
          customOptionNames[field]?.replace(" ", "_").toLowerCase() ||
          field.replace(" ", "_").toLowerCase();
      }
      voterData[key] = optionalFields[field].trim();
    });

    setVoters([...voters, voterData]);

    if (isFirstVoter) {
      setRequiredFields(selectedOptionalFields);
      setCustomOptionNamesInParent(customOptionNames);
    }

    setPublicKey("");
    setOptionalFields({});
    setInputError({});
  };

  const handleAddTwitterHandle = () => {
    if (!selectedOptionalFields.includes("Twitter Handle")) {
      setSelectedOptionalFields((prev) => [...prev, "Twitter Handle"]);
      setShowDropdown(false);
    }
  };

  const handleAddCustomOption = () => {
    if (newCustomOption.trim() === "") return;

    setSelectedOptionalFields((prev) => [...prev, newCustomOption]);
    setCustomOptionNames((prev) => ({
      ...prev,
      [newCustomOption]: newCustomOption,
    }));
    setNewCustomOption("");
    setShowDropdown(false);
  };

  const removeOptionalField = (field: string) => {
    setSelectedOptionalFields((prev) => prev.filter((f) => f !== field));
    setOptionalFields((prev) => {
      const newFields = { ...prev };
      delete newFields[field];
      return newFields;
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVoter();
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 w-full justify-start ${
        shake ? "animate-shake" : ""
      }`}
    >
      <input
        type="text"
        placeholder="Voter Public Key"
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        onKeyDown={handleKeyPress}
        className={`w-[578px] h-12 p-2 bg-[#222] text-white rounded-[23px] border ${
          inputError.publicKey ? "border-red-500" : "border-[#1E1E1E]"
        }`}
      />

      {(isFirstVoter ? selectedOptionalFields : requiredFields).map((field) => {
        const customName = customOptionNames[field] || field;
        return (
          <div
            key={field}
            className="flex items-center"
          >
            {field === "Twitter Handle" && (
              <span className="text-white mr-1">@</span>
            )}
            <input
              type="text"
              placeholder={customName}
              value={optionalFields[field] || ""}
              onChange={(e) =>
                setOptionalFields((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
              onKeyPress={handleKeyPress}
              className={`w-[140px] h-12 p-2 bg-[#222] text-white rounded-[23px] border ${
                inputError[field] ? "border-red-500" : "border-[#1E1E1E]"
              }`}
            />
            {isFirstVoter && (
              <button
                onClick={() => removeOptionalField(field)}
                className="ml-2 w-6 h-6 bg-[#1E1E1E] text-white rounded-full flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {isFirstVoter && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-12 h-12 flex items-center justify-center"
          >
            <ChevronDownIcon
              className={`w-6 h-6 text-white transform transition-transform duration-200 ${
                showDropdown ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 right-0 w-40 bg-[#222] border border-[#1E1E1E] rounded-[23px] text-white z-10 overflow-hidden">
              {!selectedOptionalFields.includes("Twitter Handle") && (
                <button
                  onClick={handleAddTwitterHandle}
                  className="w-full text-left px-4 py-3 hover:bg-[#555]"
                >
                  Twitter Handle
                </button>
              )}

              <input
                type="text"
                placeholder="Add custom field"
                value={newCustomOption}
                onChange={(e) => setNewCustomOption(e.target.value)}
                className="w-full h-12 bg-[#333] text-white focus:outline-none border-transparent focus:border-transparent focus:ring-0 px-2 "
              />
              <button
                onClick={handleAddCustomOption}
                className="w-full bg-[#444] px-2 py-3 rounded text-white hover:bg-[#555]"
              >
                Add Field
              </button>
            </div>
          )}
        </div>
      )}
      <button
        onClick={addVoter}
        className="w-12 h-12 bg-[#222] text-white rounded-[23px] border border-[#1E1E1E] flex items-center justify-center"
      >
        <PlusIcon />
      </button>
    </div>
  );
};

export default ({
  onPrevious,
  onNext,
  initialData,
}: {
  onPrevious: () => void;
  onNext: (data: types.ElectionStaticData) => void;
  initialData: types.ElectionStaticData;
}) => {
  const [voters, setVoters] = useState<types.Voter[]>(initialData.voters_list);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [customOptionNames, setCustomOptionNames] =
    useState<types.VoterCustomFields>({});

  const isNextEnabled = voters.length > 0;

  const handleNext = () => {
    if (isNextEnabled)
      onNext({
        ...initialData,
        voters_list: voters,
      });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)] max-h-[calc(100vh-162px)] p-4">
      <div className="mb-6">
        <h3 className="text-white text-xl">Add Voter Addresses</h3>
      </div>
      <div className="mb-8">
        <VoterInput
          voters={voters}
          setVoters={setVoters}
          requiredFields={requiredFields}
          setRequiredFields={setRequiredFields}
          setCustomOptionNamesInParent={setCustomOptionNames}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full overflow-y-scroll flex flex-col space-y-2 items-start">
          {voters.map((eachVoter, index) => (
            <VoterItem
              key={index}
              index={index}
              voterData={eachVoter}
              voters={voters}
              setVoters={setVoters}
              requiredFields={requiredFields}
              customOptionNames={customOptionNames}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          variant="back"
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isNextEnabled}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
