import Button from "@/components/common/Button";
import React, { useState } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import Link from "next/link";
import Clock from "@/assets/ElectionCard/Clock";
import CopyIcon from "@/assets/ElectionCard/CopyIcon";
import LearnMoreIcon from "@/assets/ElectionCard/LearnMoreIcon";
import { FaImage } from "react-icons/fa";

const ElectionCard = ({ electionData, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#1C1C1E] text-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="p-4">
          <div className="relative aspect-w-16 aspect-h-9 mb-4">
            <div className="flex w-full h-full">
              <div className="w-1/2 h-full bg-[#121315] rounded-l-lg"></div>
              <div className="w-1/2 h-full bg-[#121315] rounded-r-lg"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-[#121315] rounded w-3/4"></div>
            <div className="h-5 bg-[#121315] rounded w-1/2"></div>
            <div className="h-7 bg-[#121315] rounded w-full"></div>
            <div className="h-5 bg-[#121315] rounded w-full"></div>
            <div className="h-5 bg-[#121315] rounded w-5/6"></div>
            <div className="h-5 bg-[#121315] rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleCopyZkvoteBy = () => {
    const successful = copy(electionData.zkvoteBy);
    if (successful) {
      toast.success("zkVoter Copied");
    } else {
      toast.error("Failed to copy!");
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
    <div className="bg-[#222222] text-white rounded-xl shadow-md overflow-visible">
      <div className="p-4">
        <div className="relative aspect-w-16 aspect-h-9 mb-4">
          <div className="flex w-full h-full">
            <div className="w-full relative rounded-xl overflow-hidden">
              {image1 ? (
                <Image
                  src={image1}
                  alt="Candidate 1"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-l-lg"
                />
              ) : (
                <Placeholder className="rounded-l-lg" />
              )}
            </div>
          </div>
        </div>
        <div className="text-green-400 text-sm mb-1 flex justify-between">
          <span className="flex flex-row items-center">
            <span className="text-primary mr-1 italic text-sm">zkVote by</span>
            {electionData.zkvoteBy.slice(0, 12) + "..."}
            <span
              className="ml-1 cursor-pointer w-fit"
              onClick={handleCopyZkvoteBy}
            >
              <CopyIcon Color="#F6F6F6" />
            </span>
          </span>
          <span className="flex flex-row justify-center items-center">
            <span>
              <Clock />
            </span>
            <span className="ml-1 text-sm text-[#B7B7B7]">
              {electionData.date}
            </span>
          </span>
        </div>
        <div className="text-[#B7B7B7] text-sm mb-2 flex flex-row items-center">
          <span className="mr-2 group relative">
            <LearnMoreIcon Color="#B7B7B7" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-4  mb-2 hidden group-hover:flex flex-col items-start z-50">
              <div className="bg-[#222222]  text-gray-200 text-sm rounded-md px-3 py-4 shadow-lg w-64 text-start">
                <p className="underline">What happens if I vote twice?</p>
                <p className="text-gray-300 mt-[6px] mb-3 ">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                </p>
                <p>How could I learn if I have voted?</p>
              </div>
              <div className="w-3 h-3 bg-[#222222] rotate-45 transform translate-x-3 -translate-y-2"></div>
            </div>
          </span>
          Election id: {String(electionData.electionId).slice(0, 12) + "..."}
          <span
            onClick={handleCopyElectionId}
            className="ml-1 cursor-pointer w-fit"
          >
            <CopyIcon Color="#B7B7B7" />
          </span>
        </div>
        <h2 className="text-[24px] mb-2">{electionData.name}</h2>
        <p className="text-[#B7B7B7] italic mb-4">{electionData.description}</p>
        <div className="flex justify-between items-center translate-x-2">
          <button className="relative inline-flex items-center  py-3 font-medium text-gray-300 transition duration-300 ease-out group hover:-translate-y-1 hover:text-white">
            See Results
          </button>
          <Link href={`/elections/vote/${electionData.electionId}`}>
            <Button>Vote</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ElectionCard;