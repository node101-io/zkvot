import React, { useState } from "react";
import PlusIcon from "@/assets/CreateElection/PlusIcon.svg";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";

const OptionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const WalletInput = ({
  wallets,
  setWallets,
  requiredFields,
  setCustomOptionNamesInParent,
  setRequiredFields,
}) => {
  const [wallet, setWallet] = useState("");
  const [optionalFields, setOptionalFields] = useState({});
  const [selectedOptionalFields, setSelectedOptionalFields] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputError, setInputError] = useState({});
  const [shake, setShake] = useState(false);
  const [customOptionNames, setCustomOptionNames] = useState({});

  const availableOptionalFields = [
    "Twitter Handle",
    "Option 1",
    "Option 2",
    "Option 3",
  ];

  const isFirstWallet = wallets.length === 0;

  const addWallet = () => {
    let errors = {};
    let hasError = false;

    if (!wallet.trim()) {
      errors.wallet = true;
      hasError = true;
    }

    const fieldsToValidate = isFirstWallet
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

    const walletData = { pubkey: wallet.trim() };

    fieldsToValidate.forEach((field) => {
      let key;
      if (field === "Twitter Handle") {
        key = "twitter";
      } else {
        key =
          customOptionNames[field]?.replace(" ", "_").toLowerCase() ||
          field.replace(" ", "_").toLowerCase();
      }
      walletData[key] = optionalFields[field].trim();
    });

    setWallets([...wallets, walletData]);

    if (isFirstWallet) {
      setRequiredFields(selectedOptionalFields);
      setCustomOptionNamesInParent(customOptionNames);
    }

    setWallet("");
    setOptionalFields({});
    setInputError({});
  };

  const handleOptionSelect = (option) => {
    if (option === "Twitter Handle") {
      setSelectedOptionalFields((prev) => [...prev, option]);
    } else {
      const customName = prompt(`Enter a custom name for ${option}:`, option);
      if (customName) {
        setSelectedOptionalFields((prev) => [...prev, option]);
        setCustomOptionNames((prev) => ({
          ...prev,
          [option]: customName,
        }));
      }
    }
    setShowDropdown(false);
  };

  const removeOptionalField = (field) => {
    setSelectedOptionalFields((prev) => prev.filter((f) => f !== field));
    setOptionalFields((prev) => {
      const newFields = { ...prev };
      delete newFields[field];
      return newFields;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addWallet();
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 w-full justify-center ${
        shake ? "animate-shake" : ""
      }`}
    >
      <input
        type="text"
        placeholder="Wallet ID"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        onKeyPress={handleKeyPress}
        className={`w-[578px] h-12 p-2 bg-[#222] text-white rounded-[23px] border ${
          inputError.wallet ? "border-red-500" : "border-[#1E1E1E]"
        }`}
      />

      {(isFirstWallet ? selectedOptionalFields : requiredFields).map(
        (field) => {
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
              {isFirstWallet && (
                <button
                  onClick={() => removeOptionalField(field)}
                  className="ml-2 w-6 h-6 bg-[#1E1E1E] text-white rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          );
        }
      )}

      {isFirstWallet && (
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
            <div className="absolute top-full mt-2 right-0 w-40 bg-[#222] border border-[#1E1E1E] rounded-[23px] text-white z-10">
              {availableOptionalFields
                .filter((opt) => !selectedOptionalFields.includes(opt))
                .map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    {option}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={addWallet}
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

export default WalletInput;
