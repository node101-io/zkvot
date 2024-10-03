import React, { useState, useRef, useEffect } from "react";
import PlusIcon from "@/assets/CreateElection/PlusIcon.svg";
import Image from "next/image";

const WalletInput = ({
  wallets,
  setWallets,
  isTwitterRequired,
  setIsTwitterRequired,
}) => {
  const [wallet, setWallet] = useState("");
  const [twitter, setTwitter] = useState("");
  const [showOptionInputs, setShowOptionInputs] = useState({
    twitter: false,
    option1: false,
    option2: false,
    option3: false,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputError, setInputError] = useState({
    wallet: false,
    twitter: false,
  });
  const [shake, setShake] = useState(false);
  const dropdownRef = useRef(null);

  const showTwitterInput = isTwitterRequired || showOptionInputs.twitter;

  const addWallet = () => {
    setInputError({ wallet: false, twitter: false });
    let hasError = false;

    const walletTrimmed = wallet.trim();
    const twitterHandle = twitter.trim();

    if (!walletTrimmed) {
      setInputError((prev) => ({ ...prev, wallet: true }));
      hasError = true;
    }

    if (wallets.length === 0) {
      setIsTwitterRequired(twitterHandle.length > 0);
    } else {
      if (isTwitterRequired && !twitterHandle) {
        setInputError((prev) => ({ ...prev, twitter: true }));
        hasError = true;
      }
      if (!isTwitterRequired && twitterHandle) {
        setInputError((prev) => ({ ...prev, twitter: true }));
        hasError = true;
      }
    }

    if (hasError) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const updatedWallets = [...wallets];
    updatedWallets.push({
      wallet: walletTrimmed,
      twitter: twitterHandle || undefined,
    });

    setWallets(updatedWallets);
    setWallet("");
    setTwitter("");
    if (!isTwitterRequired) {
      setShowOptionInputs((prev) => ({ ...prev, twitter: false }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addWallet();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearTwitter = () => {
    setTwitter("");
    if (!isTwitterRequired) {
      setShowOptionInputs((prev) => ({ ...prev, twitter: false }));
    }
  };

  const handleOptionSelect = (option) => {
    setShowOptionInputs((prev) => ({ ...prev, [option]: true }));
    setShowDropdown(false);
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

      {showTwitterInput && (
        <div className="flex items-center">
          <span className="text-white mr-1">@</span>
          <input
            type="text"
            placeholder="Twitter Handle"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-[140px] h-12 p-2 bg-[#222] text-white rounded-[23px] border ${
              inputError.twitter ? "border-red-500" : "border-[#1E1E1E]"
            }`}
          />
          {!isTwitterRequired && (
            <button
              onClick={clearTwitter}
              className="ml-2 w-8 h-8 bg-[#1E1E1E] text-white rounded-full flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      )}

      {showOptionInputs.option1 && (
        <input
          type="text"
          placeholder="Option 1"
          className="w-[130px] h-12 p-2 bg-[#222222] text-white rounded-[23px] border border-[#1E1E1E]"
        />
      )}
      {showOptionInputs.option2 && (
        <input
          type="text"
          placeholder="Option 2"
          className="w-[130px] h-12 p-2 bg-[#222222] text-white rounded-[23px] border border-[#1E1E1E]"
        />
      )}
      {showOptionInputs.option3 && (
        <input
          type="text"
          placeholder="Option 3"
          className="w-[130px] h-12 p-2 bg-[#222222] text-white rounded-[23px] border border-[#1E1E1E]"
        />
      )}

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-12 h-12 bg-[#222] text-white rounded-[23px] border border-[#1E1E1E] flex items-center justify-center"
        >
          <Image
            width={20}
            height={20}
            src={PlusIcon}
            alt="Plus Icon"
          />
        </button>
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 right-0 w-40 bg-[#222] border border-[#1E1E1E] rounded-[23px] text-white z-10"
          >
            {!isTwitterRequired && !showOptionInputs.twitter && (
              <button
                onClick={() => handleOptionSelect("twitter")}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t-[23px]"
              >
                Twitter Handle
              </button>
            )}
            {!showOptionInputs.option1 && (
              <button
                onClick={() => handleOptionSelect("option1")}
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${
                  !isTwitterRequired && !showOptionInputs.twitter
                    ? ""
                    : "rounded-t-[23px]"
                }`}
              >
                Option 1
              </button>
            )}
            {!showOptionInputs.option2 && (
              <button
                onClick={() => handleOptionSelect("option2")}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Option 2
              </button>
            )}
            {!showOptionInputs.option3 && (
              <button
                onClick={() => handleOptionSelect("option3")}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-[23px]"
              >
                Option 3
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={addWallet}
        className="w-12 h-12 bg-green-600 text-white rounded-[23px] flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
};

export default WalletInput;
