import Image from "next/image";
import React from "react";
import { FaImage } from "react-icons/fa";
import { motion } from "framer-motion";

import Clock from "@/assets/ElectionCard/Clock";
import CopyIcon from "@/assets/ElectionCard/CopyIcon";
import LearnMoreIcon from "@/assets/ElectionCard/LearnMoreIcon";
import DownloadIcon from "@/assets/ElectionCard/DownloadIcon";
import MinaLogo from "@/assets/StepsProgress/MinaLastStep.svg";
import CopyButton from "../common/CopyButton";

const StepThree = ({ electionData, selectedChoice }) => {
  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );

  const results = electionData.choices.map((choice, index) => ({
    name: choice,
    percentage: Math.floor(Math.random() * 101),
  }));

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8 h-full">
      <div className="pb-4 pt-8 w-full text-start">Result</div>
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
                <span className="mr-2 group relative scale-125">
                  <LearnMoreIcon Color="#B7B7B7" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2  mb-2 hidden group-hover:flex flex-col items-start z-50">
                    <div className="bg-[#383838]  text-[#EBF0FF] text-sm rounded-3xl px-3 py-4 shadow-lg w-[370px] text-center">
                      <p>
                        It is a long established fact that a reader will be
                        distracted by the readable content of a page when
                        looking at its layout.
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-[#383838] rotate-45 transform translate-x-[180px] -translate-y-2"></div>
                  </div>
                </span>
                Election id:{" "}
                {String(electionData.electionId).slice(0, 12) + "..."}
                <span className="ml-1 cursor-pointer w-fit">
                  <CopyButton
                    textToCopy={electionData.electionId}
                    iconColor="#F6F6F6"
                    position={{ top: -26, left: -38 }}
                  />
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
                  <span className="text-primary mr-2 italic text-sm">
                    zkVote by
                  </span>
                  {electionData.zkvoteBy.slice(0, 12) + "..."}
                  <span className="ml-2 cursor-pointer w-fit">
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
        </div>

        <div className="pt-4 pb-2 w-full">
          <h3 className="text-[16px] text-[#B7B7B7] mb-4">Your Choice</h3>
          <div className="pl-4 rounded text-[20px]">
            {electionData.choices[selectedChoice]}
          </div>
        </div>
      </div>
      <div className="w-full items-start pl-8 flex text-[16px] flex-col text-[#BABABA]">
        <p className="italic">Do you think the settlement is going too slow?</p>
        <p className="underline cursor-pointer">Become a sequencer</p>
      </div>
      <div className="w-full items-start">
        <div className="flex flex-col max-w-[945px] w-full space-y-[32px] items-start mt-20 h-full">
          <div className="w-full flex flex-row items-start space-x-4 max-h-[108px]">
            <div>
              <Image
                src={MinaLogo}
                alt="afsadasd"
                width={108}
                height={108}
              />
            </div>
            <div className="flex flex-col text-white">
              <p className="text-[32px] -translate-y-1">Settled Results</p>
              <p className="w-[407px] text-[16px] leading-6 tracking-[-0.16px] font-light">
                The final results come from Mina, the settlement layer. There
                might be a small difference between the settled...
              </p>
            </div>
          </div>
          <div className="w-full h-full pb-44 space-y-7">
            {results.map((result, index) => (
              <div
                key={index}
                className="w-full flex flex-col items-start space-y-2"
              >
                <div className="flex items-center justify-start w-full">
                  <span className="text-white text-[14px]">{result.name}</span>
                  <span className="text-white text-[14px] pl-2">
                    %{result.percentage}
                  </span>
                </div>

                <div className="w-full bg-[#434446] rounded-full overflow-hidden h-[30px]">
                  <motion.div
                    className="bg-green h-full rounded-r-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${result.percentage}%` }}
                    transition={{ delay: index * 0.2 + 0.4, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
