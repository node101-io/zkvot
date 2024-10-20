"use client";

import React from "react";
import { FaImage } from "react-icons/fa";
import Clock from "@/assets/ElectionCard/Clock";

import CopyButton from "@/components/common/CopyButton";
import Image from "next/image";

const StepSeven = ({ electionData }) => {
  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );

  const base64Image = electionData.image_raw;

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8 h-full">
      <div className="pb-4 pt-8 w-full text-start">Result</div>
      <div className="flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px]">
        <div className="flex flex-col md:flex-row w-full h-fit">
          <div className="w-full md:w-1/4 flex">
            <div className="flex w-full h-32 rounded-3xl overflow-hidden">
              <div className="w-full relative">
                {base64Image ? (
                  <Image
                    src={base64Image}
                    alt="Candidate 1"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-l-lg"
                  />
                ) : (
                  <Placeholder className="rounded-l-lg" />
                )}
              </div>
            </div>
          </div>
          <div className="px-4 w-full h-fit flex flex-col justify-end">
            <span className="flex flex-row justify-center items-center ">
              <span>
                <Clock />
              </span>
              <span className="text-sm text-[#B7B7B7]">
                Start Date: {electionData.start_date}, End Date:{" "}
                {electionData.end_date}
              </span>
            </span>
          </div>
        </div>

        <div className=" flex flex-col  w-full h-fit ">
          <h2 className="text-[24px] mb-2">{electionData.question}</h2>

          <div className="flex flex-col md:flex-row justify-between py-2 gap-y-1">
            <span>
              <span className="text-[#B7B7B7] text-sm mr-1 flex flex-col items-center">
                <h1>Description:</h1>
                <span>{electionData.description}</span>
              </span>
            </span>
          </div>
        </div>

        <div className="pt-4 pb-2 w-full">
          <h3 className="text-[16px] text-[#B7B7B7] mb-4">Options</h3>
          <div className="pl-4 rounded text-[20px]">
            {electionData.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between w-full h-12 px-4 bg-[#333] rounded-[23px] mb-2"
              >
                <span className="text-[16px]">{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 pb-2 w-full">
          <h3 className="text-[16px] text-[#B7B7B7] mb-4">
            Communication Layer
          </h3>
          <div className="pl-4 rounded text-[20px]">
            {electionData.communication_layers?.map((layer, index) => (
              <div
                key={index}
                className="flex flex-col bg-[#333] rounded-[23px] mb-2 p-4"
              >
                <span className="text-[16px]">Type: {layer.type}</span>
                {layer.namespace && (
                  <span className="text-[16px]">
                    Namespace: {layer.namespace}
                  </span>
                )}
                {layer.block_height && (
                  <span className="text-[16px]">
                    Block Height: {layer.block_height}
                  </span>
                )}
                {layer.block_hash && (
                  <span className="text-[16px]">
                    Block Hash: {layer.block_hash}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 pb-2 w-full">
          <h3 className="text-[16px] text-[#B7B7B7] mb-4">Voters List</h3>
          <ul className="text-white list-disc pl-5">
            {electionData.voters_list?.map((voter, index) => (
              <li key={index}>{voter.pubkey}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StepSeven;
