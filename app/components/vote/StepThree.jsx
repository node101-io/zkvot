import Image from "next/image";
import React from "react";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import { FaImage } from "react-icons/fa";
import { motion } from "framer-motion";

import Clock from "@/assets/ElectionCard/Clock";
import CopyIcon from "@/assets/ElectionCard/CopyIcon";
import LearnMoreIcon from "@/assets/ElectionCard/LearnMoreIcon";
import DownloadIcon from "@/assets/ElectionCard/DownloadIcon";
import AvailLogo from "@/assets/DaLogos/Avail";
import CelestiaLogo from "@/assets/DaLogos/Celestia";
import MinaLogo from "@/assets/StepsProgress/MinaLastStep.svg";

const results = [
  { name: "Trump", percentage: 70 },
  { name: "Harris", percentage: 20 },
  { name: "thrid", percentage: 30 },
  { name: "fourth choice", percentage: 100 },
  { name: "lol", percentage: 55 },
];

const StepThree = ({ electionData, selectedChoice }) => {
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
      <div className="w-full items-start pl-8 flex text-[16px] flex-col text-[#BABABA]">
        <p className="italic">Do you think the settlement is going too slow?</p>
        <p className="underline cursor-pointer">Become a sequencer</p>
      </div>
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
        <div className="w-full h-full pb-44 space-y-4">
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
  );
};

export default StepThree;
