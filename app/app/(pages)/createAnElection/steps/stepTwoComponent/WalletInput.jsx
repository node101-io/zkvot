import React, { useState } from "react";
import PlusIcon from "@/assets/CreateElection/PlusIcon.svg";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";

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
  const [newCustomOption, setNewCustomOption] = useState("");

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
