"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import { FaImage } from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import LearnMoreIcon from "@/assets/ElectionCard/LearnMoreIcon";
import CopyIcon from "@/assets/ElectionCard/CopyIcon";
import Clock from "@/assets/ElectionCard/Clock";
import DownloadIcon from "@/assets/ElectionCard/DownloadIcon";
import AvailLogo from "@/assets/DaLogos/Avail";
import CelestiaLogo from "@/assets/DaLogos/Celestia";

import { KeplrWalletContext } from "@/contexts/KeplrWalletContext";
import { SubwalletContext } from "@/contexts/SubwalletContext";

const StepTwo = ({
  electionData,
  selectedChoice,
  selectedDA,
  setSelectedDA,
  goToNextStep,
  zkProofData,
  loading,
  setLoading,
}) => {
  const {
    keplrWalletAddress,
    connectKeplrWallet,
    disconnectKeplrWallet,
    sendTransactionKeplr,
  } = useContext(KeplrWalletContext);

  const {
    selectedAccount,
    connectWallet: connectSubwallet,
    disconnectWallet: disconnectSubwallet,
    sendTransactionSubwallet,
    isSubmitting,
  } = useContext(SubwalletContext);

  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);

  const handleConnectWallet = async () => {
    if (selectedDA === 0) {
      await connectSubwallet();
    } else if (selectedDA === 1) {
      await connectKeplrWallet();
    }
  };

  useEffect(() => {
    if (selectedDA === 0 && selectedAccount) {
      setWalletAddress(selectedAccount.address);
    } else if (selectedDA === 1 && keplrWalletAddress) {
      setWalletAddress(keplrWalletAddress);
    }
  }, [selectedAccount, keplrWalletAddress, selectedDA]);

  useEffect(() => {
    setWalletAddress(null);
    if (selectedDA === 0) {
      if (keplrWalletAddress) {
        disconnectKeplrWallet();
      }
      setSelectedWallet("Subwallet");
    } else if (selectedDA === 1) {
      if (selectedAccount) {
        disconnectSubwallet();
      }
      setSelectedWallet("Keplr");
    } else {
      setSelectedWallet("");
    }
  }, [selectedDA]);

  useEffect(() => {
    if (selectedDA === 0 && selectedAccount) {
      setWalletAddress(selectedAccount.address);
    } else if (selectedDA === 1 && keplrWalletAddress) {
      setWalletAddress(keplrWalletAddress);
    }
  }, [selectedAccount, keplrWalletAddress, selectedDA]);

  const handleNext = async () => {
    if (selectedDA === null) {
      alert("Please select a DA Layer to proceed.");
      return;
    }

    if (!walletAddress) {
      alert("Please connect your wallet to proceed.");
      return;
    }

    if (!zkProofData) {
      alert("ZK proof data is missing. Please go back and generate it.");
      return;
    }

    try {
      if (isSubmitting) {
        toast.info("Transaction is currently being submitted. Please wait...");
        return;
      }

      setLoading(true);

      let transactionSuccess = false;

      if (selectedDA === 1) {
        transactionSuccess = await sendTransactionKeplr(zkProofData);
      } else if (selectedDA === 0) {
        transactionSuccess = await sendTransactionSubwallet(zkProofData);
      }

      if (transactionSuccess) {
        goToNextStep();
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error("Failed to send transaction.");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const handleCopyElectionId = () => {
    const successful = copy(electionData.electionId);
    if (successful) {
      toast.success("Election ID Copied");
    } else {
      toast.error("Failed to copy!");
    }
  };

  const handleCopyZkvoteBy = () => {
    const successful = copy(electionData.zkvoteBy);
    if (successful) {
      toast.success("zkVoter Copied");
    } else {
      toast.error("Failed to copy!");
    }
  };

  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );

  const daLogos = {
    Avail: <AvailLogo className="w-12 h-12" />,
    Celestia: <CelestiaLogo className="w-12 h-12" />,
  };

  return (
    <div className="flex flex-col items-center px-8 sm:px-12 md:px-24 flex-grow py-12">
      <div className="flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px] ">
        <div className="flex flex-col md:flex-row w-full h-fit ">
          <div className="w-full md:w-1/4 flex">
            <div className="flex w-full h-32 rounded-3xl overflow-hidden">
              <div className="w-full relative">
                {electionData.images && electionData.images[0] ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={electionData.images[0]}
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
          <div className="px-4 w-full h-fit flex flex-col justify-start">
            <div className="flex flex-row w-full justify-between ">
              <div className="text-[#B7B7B7] text-sm mb-2 flex flex-row items-center ">
                <span className="mr-2 group relative">
                  <LearnMoreIcon Color="#B7B7B7" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-4  mb-2 hidden group-hover:flex flex-col items-start z-50">
                    <div className="bg-[#222222]  text-gray-200 text-sm rounded-md px-3 py-4 shadow-lg w-64 text-start">
                      <p className="underline">What happens if I vote twice?</p>
                      <p className="text-gray-300 mt-[6px] mb-3 ">
                        It is a long established fact that a reader will be
                        distracted by the readable content of a page when
                        looking at its layout.
                      </p>
                      <p>How could I learn if I have voted?</p>
                    </div>
                    <div className="w-3 h-3 bg-[#222222] rotate-45 transform translate-x-3 -translate-y-2"></div>
                  </div>
                </span>
                Election id:{" "}
                {String(electionData.electionId).slice(0, 12) + "..."}
                <span
                  onClick={handleCopyElectionId}
                  className="ml-1 cursor-pointer w-fit"
                >
                  <CopyIcon Color="#B7B7B7" />
                </span>
              </div>
              <span className="flex flex-row justify-center items-center ">
                <span>
                  <Clock />
                </span>
                <span className="ml-1 text-sm text-[#B7B7B7]">
                  {electionData.date}
                </span>
              </span>
            </div>
            <div className=" flex flex-col  w-full h-fit ">
              <h2 className="text-[24px] mb-2">{electionData.name}</h2>

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
                  <span className="text-primary mr-1 italic text-sm">
                    zkVote by
                  </span>
                  {electionData.zkvoteBy.slice(0, 12) + "..."}
                  <span
                    className="ml-1 cursor-pointer w-fit"
                    onClick={handleCopyZkvoteBy}
                  >
                    <CopyIcon Color="#F6F6F6" />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4 pb-2 w-full">
          <h3 className="text-[16px] text-[#B7B7B7] mb-4">Your Choice</h3>
          <div className="pl-4 rounded text-[20px]">
            {electionData.choices[selectedChoice]}
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${
          isSubmitting
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : ""
        }`}
      >
        {electionData.DAChoicesName.map((DA, index) => (
          <div
            key={index}
            className={`p-4 bg-[#222222] rounded-2xl flex items-center transition duration-200 ${
              selectedDA === index
                ? "border-[1px] border-primary shadow-lg"
                : "hover:bg-[#333333]"
            }`}
            onClick={() => !isSubmitting && setSelectedDA(index)}
          >
            <div className="flex-shrink-0 mr-4">
              {daLogos[DA] || (
                <div className="w-12 h-12 bg-gray-500 rounded-full" />
              )}
            </div>
            <div className="flex flex-col h-full justify-between">
              <h3 className="text-white text-[24px] mb-2">{DA}</h3>
              <p className="text-[16px] mb-2">
                {electionData.DAChoicesDescription[index]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[16px]">
                  Fee: {electionData.DAChoicesFee[index]}{" "}
                  {electionData.DAChoicesCurrency[index]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full pt-8 flex justify-end">
        {walletAddress ? (
          <Button
            onClick={handleNext}
            disabled={!walletAddress || selectedDA === null || isSubmitting}
            loading={isSubmitting}
          >
            Submit Vote
          </Button>
        ) : (
          <div className={`${selectedDA === null ? "hidden" : "flex"}`}>
            <Button onClick={handleConnectWallet}>
              Connect {selectedWallet} Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTwo;
