import React, { useState } from "react";
import DeleteIcon from "../../../../../assets/CreateElection/DeleteIcon.svg";
import EditIcon from "../../../../../assets/CreateElection/EditIcon.svg";
import Image from "next/image";

const WalletItem = ({
  index,
  walletData,
  wallets,
  setWallets,
  requiredFields = [],
  customOptionNames = {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [wallet, setWallet] = useState(walletData.pubkey);
  const [optionalFields, setOptionalFields] = useState(() => {
    const fields = {};
    requiredFields.forEach((field) => {
      let key;
      if (field === "Twitter Handle") {
        key = "twitter";
      } else {
        key =
          customOptionNames[field]?.replace(" ", "_").toLowerCase() ||
          field.replace(" ", "_").toLowerCase();
      }
      fields[field] = walletData[key] || "";
    });
    return fields;
  });

  const [inputError, setInputError] = useState({});

  const saveEdit = () => {
    let errors = {};
    let hasError = false;

    if (!wallet.trim()) {
      errors.wallet = true;
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

    const updatedWalletData = { wallet: wallet.trim() };
    requiredFields.forEach((field) => {
      const key = field.replace(" ", "_").toLowerCase();
      updatedWalletData[key] = optionalFields[field].trim();
    });

    const updatedWallets = [...wallets];
    updatedWallets[index] = updatedWalletData;
    setWallets(updatedWallets);
    setIsEditing(false);
    setInputError({});
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setWallet(walletData.wallet);
    setOptionalFields(() => {
      const fields = {};
      requiredFields.forEach((field) => {
        const key = field.replace(" ", "_").toLowerCase();
        fields[field] = walletData[key] || "";
      });
      return fields;
    });
    setInputError({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEdit();
    }
  };

  const deleteWallet = () => {
    const updatedWallets = wallets.filter((_, i) => i !== index);

    setWallets(updatedWallets);

    if (index === 0 && updatedWallets.length > 0) {
      const newFirstWallet = updatedWallets[0];
      const newRequiredFields = requiredFields.filter((field) => {
        const key = field.replace(" ", "_").toLowerCase();
        return newFirstWallet[key];
      });
    }
  };

  return (
    <div className="w-[740px] max-h-12 min-h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px] border border-[#1E1E1E]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`flex-1 h-8 p-1 bg-[#222] text-white rounded-[73px] border ${
              inputError.wallet ? "border-red-500" : "border-[#1E1E1E]"
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
            <Image
              src={DeleteIcon}
              alt="Delete"
              width={20}
              height={20}
            />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-[#B7B7B7] text-[14px]  overflow-x-scroll">
            {walletData.pubkey}
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
              walletData[key] && (
                <div
                  key={field}
                  className="flex items-center px-2 py-1 bg-[#222222] rounded-full mx-2 text-[#B7B7B7] text-[14px]  max-w-[150px] overflow-x-scroll"
                >
                  <span className="text-nowrap">
                    {field === "Twitter Handle"
                      ? `@${walletData[key]}`
                      : `${displayName}: ${walletData[key]}`}
                  </span>
                </div>
              )
            );
          })}
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
            onClick={deleteWallet}
            className="rounded-full flex items-center justify-center mx-1"
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

export default WalletItem;
