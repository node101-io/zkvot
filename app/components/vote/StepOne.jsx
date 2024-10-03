"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import { FaImage } from "react-icons/fa";
import { toast } from "react-toastify";
import copy from "copy-to-clipboard";
import { IoClose } from "react-icons/io5";

import Button from "@/components/common/Button";
import LearnMoreIcon from "@/assets/ElectionCard/LearnMoreIcon";
import Clock from "@/assets/ElectionCard/Clock";
import CopyIcon from "@/assets/ElectionCard/CopyIcon";
import DownloadIcon from "@/assets/ElectionCard/DownloadIcon";

import { MinaWalletContext } from "@/contexts/MinaWalletContext";

const StepOne = ({
  electionData,
  selectedChoice,
  setSelectedChoice,
  setLoading,
  loading,
  submitZkProof,
  goToNextStep,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { minaWalletAddress, connectMinaWallet, disconnectMinaWallet } =
    useContext(MinaWalletContext);

  const handleVoteClick = async () => {
    if (!minaWalletAddress) {
      toast.error("Please connect your Mina wallet to proceed.");
      return;
    }
    if (selectedChoice === null) {
      toast.error("Please select a choice to proceed.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmAndContinue = async () => {
    try {
      setLoading(true);
      setIsModalOpen(false);
      await submitZkProof();

      disconnectMinaWallet();

      goToNextStep();
    } catch (error) {
      console.error("Error submitting zkProof:", error.message || error);
      toast.error("Error submitting zkProof.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
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

  const image1 =
    electionData.images && electionData.images[0]
      ? electionData.images[0]
      : null;

  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center  h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8 ">
      <div className="py-4 w-full text-start">
        Already voted?{"  "}
        <button className="relative inline-flex items-center font-medium text-gray-300 transition duration-300 ease-out hover:text-white">
          See Results
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-start w-full h-full text-white mb-6 flex-grow">
        <div className="w-full md:w-1/2 flex">
          <div className="flex w-full h-64 rounded-3xl overflow-hidden">
            <div className="w-full relative">
              {image1 ? (
                <div className="w-full h-full relative">
                  <Image
                    src={image1}
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
        <div className="p-4  w-full h-full flex flex-col justify-between ">
          <div className="flex flex-row w-full justify-between">
            <div className="text-[#B7B7B7] text-sm mb-2 flex flex-row items-center">
              <span className="mr-2 group relative scale-125">
                <LearnMoreIcon Color="#B7B7B7" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-4  mb-2 hidden group-hover:flex flex-col items-start z-50">
                  <div className="bg-[#222222]  text-gray-200 text-sm rounded-md px-3 py-4 shadow-lg w-64 text-start">
                    <p className="underline">What happens if I vote twice?</p>
                    <p className="text-gray-300 mt-[6px] mb-3 ">
                      It is a long established fact that a reader will be
                      distracted by the readable content of a page when looking
                      at its layout.
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
            <p
              className={`my-4 text-[16px] italic text-[#F6F6F6] ${
                !isExpanded ? "" : ""
              }`}
            >
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

      <div className="w-full  my-5">
        <h3 className="text-xl mb-4">Choices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {electionData.choices.map((choice, index) => (
            <button
              key={index}
              className={`p-4 text-center bg-[#222222] rounded-2xl  
                ${
                  selectedChoice === index
                    ? " border-primary border-[1px] shadow-lg"
                    : " hover:bg-[#333333]"
                }`}
              onClick={() => setSelectedChoice(index)}
              disabled={loading}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full pt-8 flex justify-end">
        {minaWalletAddress ? (
          <Button
            onClick={handleVoteClick}
            disabled={!minaWalletAddress || selectedChoice === null}
            loading={loading}
          >
            Vote
          </Button>
        ) : (
          <Button onClick={connectMinaWallet}>Connect Mina Wallet</Button>
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
                <h3 className="text-xl  mb-4">
                  Wait a sec, have you voted before?
                </h3>

                <p className=" mb-8">
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
    </div>
  );
};

export default StepOne;
