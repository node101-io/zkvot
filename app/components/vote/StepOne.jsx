"use client";
import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import { FaImage } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import Button from "@/components/common/Button";
import LearnMoreIcon from "@/assets/ElectionCard/LearnMoreIcon";
import Clock from "@/assets/ElectionCard/Clock";

import DownloadIcon from "@/assets/ElectionCard/DownloadIcon";
import { MinaWalletContext } from "@/contexts/MinaWalletContext";
import { MetamaskWalletContext } from "@/contexts/MetamaskWalletContext";
import WalletSelectionModal from "../common/WalletSelectionModal";
import CopyButton from "../common/CopyButton";
import { useToast } from "../ToastProvider";
import ToolTip from "../common/ToolTip";

const StepOne = ({
  electionData,
  selectedoption,
  setSelectedoption,
  setLoading,
  loading,
  submitZkProof,
  goToNextStep,
  selectedWallet,
  setSelectedWallet,
}) => {
  const showToast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [eligibilityStatus, setEligibilityStatus] = useState("not_connected");

  const {
    minaWalletAddress,
    connectMinaWallet,
    disconnectMinaWallet,
    signElectionId,
  } = useContext(MinaWalletContext);

  const {
    metamaskWalletAddress,
    connectMetamaskWallet,
    disconnectMetamaskWallet,
  } = useContext(MetamaskWalletContext);

  const userWalletAddresses = [metamaskWalletAddress, minaWalletAddress]
    .filter(Boolean)
    .map((addr) => addr.trim().toLowerCase());

  useEffect(() => {
    if (
      userWalletAddresses.length > 0 &&
      electionData &&
      electionData.voters_list
    ) {
      setEligibilityStatus("checking");

      const votersNormalized = electionData.voters_list.map((voter) =>
        voter.address.trim().toLowerCase()
      );

      const eligible = userWalletAddresses.some((wallet) =>
        votersNormalized.includes(wallet)
      );

      if (eligible) {
        setEligibilityStatus("eligible");
      } else {
        setEligibilityStatus("not_eligible");
      }
    } else {
      setEligibilityStatus("not_connected");
    }
  }, [userWalletAddresses, electionData]);

  useEffect(() => {
    return () => {
      setEligibilityStatus("not_connected");
    };
  }, []);

  const handleWalletSelection = async (wallet) => {
    if (selectedWallet === "Mina") {
      await disconnectMinaWallet();
    } else if (selectedWallet === "Metamask") {
      await disconnectMetamaskWallet();
    }

    setSelectedWallet(wallet);
    setIsWalletModalOpen(false);

    let connectionSuccess = false;

    if (wallet === "Mina") {
      connectionSuccess = await connectMinaWallet();
    } else if (wallet === "Metamask") {
      connectionSuccess = await connectMetamaskWallet();
    }

    if (connectionSuccess) {
      showToast("Wallet connected successfully!", "success");
    } else {
      setSelectedWallet(null);
      showToast("Wallet connection was not successful.", "error");
    }
  };
  const handleVoteClick = async () => {
    if (
      selectedoption === null &&
      eligibilityStatus !== "not_eligible" &&
      eligibilityStatus !== "not_connected"
    ) {
      showToast("Please select a option to proceed.", "error");
      return;
    }

    if (eligibilityStatus === "eligible") {
      await handleConfirmAndContinue();
      return;
    }

    if (eligibilityStatus === "not_eligible") {
      if (selectedWallet === "Mina") {
        await disconnectMinaWallet();
      } else if (selectedWallet === "Metamask") {
        await disconnectMetamaskWallet();
      }
      setSelectedWallet(null);
      setIsWalletModalOpen(true);
      return;
    }

    if (eligibilityStatus === "not_connected") {
      setIsWalletModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const checkWalletConnection = () => {
    if (selectedWallet === "Mina") {
      return !!minaWalletAddress;
    } else if (selectedWallet === "Metamask") {
      return !!metamaskWalletAddress;
    }
    return false;
  };

  const generateElectionJson = (
    electionData,
    signedElectionId,
    selectedoption,
    votersArray,
    publicKey
  ) => {
    return {
      electionId: electionData._id,
      signedElectionId,
      vote: selectedoption,
      votersArray: votersArray.map(
        (voter) => voter.address?.trim().toLowerCase() || ""
      ),
      publicKey: publicKey,
    };
  };

  const handleConfirmAndContinue = async () => {
    try {
      setLoading(true);
      setIsModalOpen(false);

      if (!checkWalletConnection()) {
        showToast("Wallet not connected.", "error");
        return;
      }

      if (eligibilityStatus !== "eligible") {
        showToast("You are not eligible to vote in this election.", "error");
        return;
      }

      const signedElectionId = await signElectionId(electionData._id);
      console.log("signedElectionId", signedElectionId);
      if (!signedElectionId) {
        showToast("Failed to generate the signed election ID.", "error");
        return;
      }

      await submitZkProof();

      const votersArray = electionData.voters_list.map(
        (voter) => voter.address
      );
      const publicKey =
        selectedWallet === "Mina" ? minaWalletAddress : metamaskWalletAddress;

      const electionJson = generateElectionJson(
        electionData,
        signedElectionId,
        selectedoption,
        votersArray,
        publicKey
      );

      console.log("electionJson", electionJson);

      await submitElectionVote(electionJson);

      if (selectedWallet === "Mina") {
        disconnectMinaWallet();
      } else if (selectedWallet === "Metamask") {
        disconnectMetamaskWallet();
      }

      goToNextStep();
    } catch (error) {
      console.error("Error submitting zkProof:", error.message || error);
      showToast("Error submitting zkProof.", "error");
    } finally {
      setLoading(false);
    }
  };

  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );
  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8">
      <div className="py-4 w-full text-start">
        Already voted?{" "}
        <button className="relative inline-flex items-center font-medium text-gray-300 transition duration-300 ease-out hover:text-white">
          See Results
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start w-full h-full text-white mb-6 flex-grow">
        <div className="w-full md:w-1/2 flex">
          <div className="flex w-full h-64 rounded-3xl overflow-hidden">
            <div className="w-full relative">
              {electionData.image_raw ? (
                <div className="w-full h-full relative">
                  <Image
                    src={electionData.image_raw}
                    alt="Candidate 1"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-l-lg"
                  />
                </div>
              ) : (
                <Placeholder className="rounded-l-lg" />
              )}
            </div>
          </div>
        </div>
        <div className="p-4 w-full h-full flex flex-col justify-between">
          <div className="flex flex-row w-full justify-between">
            <div className="text-[#B7B7B7] text-sm mb-2 flex flex-row items-center">
              <span className="mr-2 group relative">
                <ToolTip
                  content="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
                  position="top"
                  arrowPosition="start"
                >
                  <LearnMoreIcon Color="#B7B7B7" />
                </ToolTip>
              </span>
              Election id:{" "}
              {String(electionData.electionId).slice(0, 12) + "..."}
              <div className="ml-2">
                <CopyButton
                  textToCopy={electionData.electionId}
                  iconColor="#B7B7B7"
                  position={{ top: -20, left: -38 }}
                />
              </div>
            </div>
            <span className="flex flex-row justify-center items-center">
              <span>
                <Clock />
              </span>
              <span className="ml-1 text-sm text-[#B7B7B7]">
                {electionData.date}
              </span>
            </span>
          </div>
          <div className="flex-grow min-h-52">
            <h2 className="text-[24px] mb-2">{electionData.name}</h2>
            <p className={`my-4 text-[16px] italic text-[#F6F6F6]`}>
              {electionData.description}
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between py-2 gap-y-1">
            <span>
              <span className="text-[#B7B7B7] text-sm mr-1 flex flex-row items-center">
                {electionData.assignedVoters} Assigned Voters
                <span className="mx-1">-</span>
                <span className="text-green text-sm">
                  {electionData.votedNow} Voted Now
                </span>
                <button
                  onClick={() => {
                    console.log("download");
                  }}
                  className="ml-2"
                >
                  <DownloadIcon />
                </button>
              </span>
            </span>
            <span className="flex flex-row items-center">
              <span className="text-primary mr-2 italic text-sm">
                zkVote by
              </span>
              {electionData.zkvoteBy
                ? electionData.zkvoteBy.slice(0, 12) + "..."
                : "Unknown"}
              <span className="ml-2 cursor-pointer w-fit relative">
                <CopyButton
                  textToCopy={electionData.zkvoteBy}
                  iconColor="#F6F6F6"
                  position={{ top: -26, left: -38 }}
                />
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full my-5">
        <h3 className="text-xl mb-4">options</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {electionData.options.map((option, index) => (
            <button
              key={index}
              className={`p-4 text-center bg-[#222222] rounded-2xl  
        ${
          selectedoption === index
            ? "border-primary border-[1px] shadow-lg"
            : "hover:bg-[#333333]"
        }
        ${eligibilityStatus !== "eligible" ? "cursor-not-allowed" : ""}`}
              onClick={() => setSelectedoption(index)}
              disabled={loading || eligibilityStatus !== "eligible"}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full pt-8 flex justify-end space-x-4">
        <Button
          onClick={handleVoteClick}
          loading={loading}
        >
          {eligibilityStatus === "eligible"
            ? "Vote"
            : eligibilityStatus === "not_eligible"
            ? "Switch Wallet"
            : "Connect wallet to check eligibility"}
        </Button>

        {isWalletModalOpen && (
          <WalletSelectionModal
            availableWallets={["Mina", "Metamask"]}
            onClose={() => setIsWalletModalOpen(false)}
            onSelectWallet={handleWalletSelection}
          />
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#141414] rounded-[50px] p-8 shadow-lg w-[680px] h-auto border-[1px] border-primary text-center relative">
              <button
                onClick={handleCloseModal}
                className="flex w-full justify-end"
              >
                <IoClose size={28} />
              </button>
              <div className="px-[57px] py-2">
                <h3 className="text-xl mb-4">
                  Wait a sec, have you voted before?
                </h3>

                <p className="mb-8">
                  Since it is fully anonymous, it is not really easy to
                  understand if you have voted before or not. Nevertheless, if
                  you send your vote twice, it will not be counted for the
                  second time. There is absolutely no danger of sending a vote
                  twice, but please do not, as it just frustrates our
                  sequencers.
                </p>

                <div className="flex justify-center pt-9">
                  <Button
                    loading={loading}
                    onClick={handleConfirmAndContinue}
                  >
                    Nope, please continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {eligibilityStatus === "not_eligible" && (
        <div className="w-full mt-2 text-center text-gray-300 text-sm">
          You’re not eligible for this election. You might be connected to the
          wrong wallet. Please try switching wallets{" "}
        </div>
      )}
    </div>
  );
};

export default StepOne;
