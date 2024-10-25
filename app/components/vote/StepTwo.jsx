"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { FaImage } from "react-icons/fa";

import Button from "../../components/common/Button";
import LearnMoreIcon from "../../assets/ElectionCard/LearnMoreIcon";
import Clock from "../../assets/ElectionCard/Clock";
import DownloadIcon from "../../assets/ElectionCard/DownloadIcon";
import AvailLogo from "../../assets/DaLogos/Avail";
import CelestiaLogo from "../../assets/DaLogos/Celestia";
import { SubwalletContext } from "../../contexts/SubwalletContext";
import CopyButton from "../common/CopyButton";
import ToolTip from "../common/ToolTip";
import { sendDataToBackend } from "../../utils/api";
import { useToast } from "../ToastProvider";

const daDetails = {
  avail: {
    description:
      "It is a long established fact that a reader will be distracted.",
    fee: 1.2593,
    currency: "$AVAIL",
  },
  celestia: {
    description:
      "It is a long established fact that a reader will be distracted.",
    fee: 1.4212,
    currency: "$CELE",
  },
};

const ModeSelection = ({ selectionMode, setSelectionMode }) => {
  return (
    <div className="flex mb-6 w-full space-x-6">
      <button
        onClick={() => setSelectionMode("direct")}
        className={`focus:outline-none ${
          selectionMode === "direct"
            ? "text-white border-b-[1px] pb-1 border-primary"
            : "text-[#B7B7B7]"
        }`}
      >
        Direct Thru Chain
      </button>
      <button
        onClick={() => setSelectionMode("backend")}
        className={`focus:outline-none ${
          selectionMode === "backend"
            ? "text-white border-b-[1px] pb-1 border-primary"
            : "text-[#B7B7B7]"
        }`}
      >
        Thru Our Backends
      </button>
    </div>
  );
};

const DASelection = ({
  communicationLayers,
  selectedDA,
  setSelectedDA,
  daDetails,
  daLogos,
  isSubmitting,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${
        isSubmitting ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      }`}
    >
      {communicationLayers.map((layer) => (
        <div
          key={layer._id}
          className={`p-4 bg-[#222222] rounded-2xl cursor-pointer flex items-center transition duration-200 ${
            selectedDA === layer.type
              ? "border-[1px] border-primary shadow-lg"
              : "hover:bg-[#333333]"
          }`}
          onClick={() => !isSubmitting && setSelectedDA(layer.type)}
        >
          <div className="flex-shrink-0 mr-4">
            {daLogos[layer.type] || (
              <div className="w-12 h-12 bg-gray-500 rounded-full" />
            )}
          </div>
          <div className="flex flex-col h-full justify-between">
            <h3 className="text-white text-[24px] mb-2">
              {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
            </h3>
            <p className="text-[16px] mb-2">
              {daDetails[layer.type]?.description ||
                "No description available."}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[16px]">
                Fee: {daDetails[layer.type]?.fee}{" "}
                {daDetails[layer.type]?.currency}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StepTwo = ({
  electionData,
  selectedOption,
  selectedDA,
  setSelectedDA,
  goToNextStep,
  zkProofData,
  setLoading,
}) => {
  const {
    selectedAccount,
    connectWallet: connectSubwallet,
    disconnectWallet: disconnectSubwallet,
    sendTransactionSubwallet,
    isSubmitting,
  } = useContext(SubwalletContext);
  const toast = useToast();

  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectionMode, setSelectionMode] = useState("direct");

  const handleConnectWallet = async () => {
    console.log("Connecting wallet...");
    if (selectedDA === "avail" && selectedAccount) {
      setWalletAddress(selectedAccount.address);
    }
    console.log("Wallet connected.", selectedAccount.address);
  };

  useEffect(() => {
    if (selectedDA === "avail" && selectedAccount) {
      setWalletAddress(selectedAccount.address);
    }
  }, [selectedAccount, selectedDA]);

  useEffect(() => {
    setWalletAddress(null);
    if (selectedDA === "avail") {
      setSelectedWallet("Subwallet");
    }
  }, [selectedDA, selectedAccount, disconnectSubwallet]);

  const handleNext = async () => {
    if (!selectedDA) {
      showToast("Please select a DA Layer to proceed.", "error");

      return;
    }

    if (selectionMode === "direct") {
      if (!walletAddress) {
        showToast("Please connect your wallet to proceed.", "error");
        return;
      }
      if (!zkProofData) {
        showToast(
          "ZK proof data is missing. Please go back and generate it.",
          "error"
        );
        return;
      }
    } else if (selectionMode === "backend") {
      if (!zkProofData) {
        showToast(
          "ZK proof data is missing. Please go back and generate it.",
          "error"
        );
        return;
      }
    }

    try {
      setLoading(true);

      if (selectionMode === "direct") {
        let transactionSuccess = false;

        if (selectedDA === "avail") {
          transactionSuccess = await sendTransactionSubwallet(zkProofData);
        }

        if (transactionSuccess) {
          goToNextStep();
        } else {
          throw new Error("Failed to send transaction.");
        }
      } else if (selectionMode === "backend") {
        const payload = {
          electionId: electionData.mina_contract_id,
          selectedDA,
          zkProofData,
        };

        const response = await sendDataToBackend(payload);
        console.log("Backend response:", response);

        if (response.success) {
          goToNextStep();
        } else {
          throw new Error(
            response.error || "Failed to submit vote to backend."
          );
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in handleNext:", error);
      alert(error.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );

  const filteredLayers =
    selectionMode === "direct"
      ? electionData.communication_layers.filter(
          (layer) => layer.type === "avail"
        )
      : electionData.communication_layers;

  const daLogos = {
    avail: <AvailLogo className="w-12 h-12" />,
    celestia: <CelestiaLogo className="w-12 h-12" />,
  };

  return (
    <div className="flex flex-col items-center px-8 sm:px-12 md:px-24 flex-grow py-12">
      <div className="flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px] ">
        <div className="flex flex-col md:flex-row w-full h-fit ">
          <div className="w-full md:w-1/4 flex">
            <div className="flex w-full h-32 rounded-3xl overflow-hidden">
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
          <div className="px-4 w-full h-fit flex flex-col justify-start">
            <div className="flex flex-row w-full justify-between ">
              <div className="text-[#B7B7B7] text-sm mb-2 flex flex-row items-center ">
                <span className="mr-2">
                  <ToolTip
                    content="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
                    position="top"
                    arrowPosition="start"
                  >
                    <LearnMoreIcon Color="#B7B7B7" />
                  </ToolTip>
                </span>
                Election id:{" "}
                {String(electionData.mina_contract_id).slice(0, 12) + "..."}
                <span className="ml-1 cursor-pointer w-fit">
                  <CopyButton
                    textToCopy={electionData.mina_contract_id}
                    iconColor="#F6F6F6"
                    position={{ top: -26, left: -38 }}
                  />{" "}
                </span>
              </div>
              <span className="flex flex-row justify-center items-center ">
                <span>
                  <Clock />
                </span>
                <span className="ml-1 text-sm text-[#B7B7B7]">
                  {electionData.start_date}
                </span>
              </span>
            </div>
            <div className=" flex flex-col  w-full h-fit ">
              <h2 className="text-[24px] mb-2">{electionData.question}</h2>

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
                    : "Unknown"}{" "}
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
            {electionData.options[selectedOption]}
          </div>
        </div>
      </div>

      <ModeSelection
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
      />

      <DASelection
        communicationLayers={filteredLayers}
        selectedDA={selectedDA}
        setSelectedDA={setSelectedDA}
        daDetails={daDetails}
        daLogos={daLogos}
        isSubmitting={isSubmitting}
      />

      <div className="w-full pt-8 flex justify-end">
        {selectionMode === "direct" ? (
          walletAddress ? (
            <Button
              onClick={handleNext}
              disabled={!walletAddress || !selectedDA || isSubmitting}
              loading={isSubmitting}
            >
              Submit Vote
            </Button>
          ) : (
            <div className={`${!selectedDA ? "hidden" : "flex"}`}>
              <Button onClick={handleConnectWallet}>
                Connect {selectedWallet} Wallet
              </Button>
            </div>
          )
        ) : (
          <Button
            onClick={handleNext}
            disabled={!selectedDA || isSubmitting}
            loading={isSubmitting}
          >
            Submit Vote
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepTwo;
