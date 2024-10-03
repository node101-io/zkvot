import React, { useState } from "react";
import DeleteIcon from "@/assets/CreateElection/DeleteIcon.svg";
import EditIcon from "@/assets/CreateElection/EditIcon.svg";
import Image from "next/image";

const WalletItem = ({
  index,
  walletData,
  wallets,
  setWallets,
  isTwitterRequired,
  setIsTwitterRequired,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [wallet, setWallet] = useState(walletData.wallet);
  const [twitter, setTwitter] = useState(walletData.twitter || "");

  const saveEdit = () => {
    if (wallet.trim()) {
      const updatedWallets = [...wallets];
      const twitterHandle = twitter.trim();

      const newWalletEntry = {
        wallet,
        twitter: twitterHandle || undefined,
      };

      if (index === 0) {
        const newIsTwitterRequired = twitterHandle.length > 0;
        const wasTwitterRequired = isTwitterRequired;

        if (newIsTwitterRequired !== wasTwitterRequired) {
          setIsTwitterRequired(newIsTwitterRequired);

          for (let i = 0; i < updatedWallets.length; i++) {
            if (i !== index) {
              const w = updatedWallets[i];
              if (newIsTwitterRequired && !w.twitter) {
                alert("All wallets must have a Twitter handle.");
                return;
              }
              if (!newIsTwitterRequired && w.twitter) {
                alert("All wallets should be without a Twitter handle.");
                return;
              }
            }
          }
        }
      } else {
        if (isTwitterRequired && !twitterHandle) {
          alert("All wallets must have a Twitter handle.");
          return;
        }
        if (!isTwitterRequired && twitterHandle) {
          alert("All wallets should be without a Twitter handle.");
          return;
        }
      }

      updatedWallets[index] = newWalletEntry;
      setWallets(updatedWallets);
      setIsEditing(false);
    }
  };

  const deleteWallet = () => {
    const updatedWallets = wallets.filter((_, i) => i !== index);

    if (updatedWallets.length === 0) {
      setIsTwitterRequired(false);
    } else if (index === 0) {
      const newIsTwitterRequired = updatedWallets[0].twitter ? true : false;

      if (newIsTwitterRequired !== isTwitterRequired) {
        setIsTwitterRequired(newIsTwitterRequired);
        for (let i = 1; i < updatedWallets.length; i++) {
          const w = updatedWallets[i];
          if (newIsTwitterRequired && !w.twitter) {
            alert("All wallets must have a Twitter handle.");
            return;
          }
          if (!newIsTwitterRequired && w.twitter) {
            alert("All wallets should be without a Twitter handle.");
            return;
          }
        }
      }
    }

    setWallets(updatedWallets);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setWallet(walletData.wallet);
    setTwitter(walletData.twitter || "");
  };

  const clearTwitter = () => {
    setTwitter("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEdit();
    }
  };

  return (
    <div className="w-[620px] h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px] border border-[#1E1E1E]">
      {isEditing ? (
        <>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-8 p-1 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E] mr-2"
          />
          <div className="flex items-center">
            <span className="text-white mr-1">@</span>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-[130px] h-8 p-1 bg-[#222] text-white rounded-[73px] border border-[#1E1E1E]"
            />
            {twitter && (
              <button
                onClick={clearTwitter}
                className="ml-2 w-6 h-6 bg-[#1E1E1E] text-white rounded-full flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={saveEdit}
            className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center ml-2"
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center ml-2"
          >
            ×
          </button>
        </>
      ) : (
        <>
          <span className="flex-1">{walletData.wallet}</span>
          {walletData.twitter && (
            <div className="flex items-center px-2 py-1 bg-[#222] border border-[#AFEEEE] rounded-full mx-2">
              <span>@{walletData.twitter}</span>
            </div>
          )}
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

export default WalletItem;
