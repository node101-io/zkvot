"use client";
// import LearnMoreIcon from "../../../assets/ElectionCard/LearnMoreIcon";
import ToolTip from "../../../components/common/ToolTip";
import AssignedElections from "../../../components/elections/AssignedElections/AssignedElections";
import { MetamaskWalletContext } from "../../../contexts/MetamaskWalletContext";
import { MinaWalletContext } from "../../../contexts/MinaWalletContext";
import React, { useContext, useState } from "react";

const Page = () => {
  const [activePanel, setActivePanel] = useState("Assigned Elections");
  const [onlyOngoing, setOnlyOngoing] = useState(false);

  const { metamaskWalletAddress } = useContext(MetamaskWalletContext);
  const { minaWalletAddress } = useContext(MinaWalletContext);

  const isWalletConnected = metamaskWalletAddress || minaWalletAddress;

  return (
    <div className="flex justify-center">
      <div className="mt-14 w-full flex flex-col px-4 max-w-[1052px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="flex mb-2 md:mb-0 space-x-12">
            <button
              onClick={() => setActivePanel("Assigned Elections")}
              className={`focus:outline-none ${
                activePanel === "Assigned Elections"
                  ? "text-white border-b-[1px] pb-1 border-primary"
                  : "text-[#B7B7B7]"
              }`}
            >
              Assigned Elections
            </button>
            <button
              onClick={() => setActivePanel("Voted Elections")}
              className={`focus:outline-none ${
                activePanel === "Voted Elections"
                  ? "text-white border-b-[1px] pb-1 border-primary"
                  : "text-[#B7B7B7]"
              }`}
            >
              Voted Elections
            </button>
          </div>
          <ToolTip
            content="Connect wallet to use"
            showTooltip={!isWalletConnected}
            position="top"
            arrowPosition="start"
          >
            <div className="flex items-center">
              <input
                id="onlyOngoing"
                type="checkbox"
                checked={onlyOngoing}
                onChange={() => setOnlyOngoing(!onlyOngoing)}
                className={`mr-2 w-4 h-4 rounded-sm cursor-pointer border accent-green ${
                  onlyOngoing
                    ? "bg-green-500 border-green"
                    : "appearance-none border-[#B7B7B7]"
                }`}
                disabled={!isWalletConnected}
              />
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <label
                    htmlFor="onlyOngoing"
                    className={`cursor-pointer ${
                      onlyOngoing ? "text-green" : "text-[#B7B7B7]"
                    }`}
                  >
                    Only show elections you are eligible to vote
                  </label>
                </div>
              </div>
            </div>
          </ToolTip>
        </div>

        <div className="px-6">
          {activePanel === "Assigned Elections" && (
            <div className="py-8">
              <AssignedElections
                onlyOngoing={onlyOngoing}
                metamaskWalletAddress={metamaskWalletAddress}
                minaWalletAddress={minaWalletAddress}
              />
            </div>
          )}
          {activePanel === "Voted Elections" && (
            <div className="flex w-full min-h-[40vh] justify-center items-center">
              <p className="max-w-3xl text-center text-gray-400">
                Ups, something went wrong. Just kidding... This is actually you
                not seeing your previous elections because it is impossible to
                do so in a truly anonymous system. Do not get us wrong, you
                cannot vote twice, but the only way to anonymously see if you
                have voted for an election or not is to check all single votes
                in the client side. If you are looking for a specific election,
                just click the “See if I have Voted Before” in an election’s
                page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
