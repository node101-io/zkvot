"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import TopSection from "./TopSection.jsx";
import Panel from "./Panel.jsx";
import { MinaWalletContext } from "../../contexts/MinaWalletContext.js";

const hero = () => {
  const [activePanel, setActivePanel] = useState(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const heroRef = useRef(null);
  const [electionID, setElectionID] = useState("");

  const { minaWalletAddress, connectMinaWallet } =
    useContext(MinaWalletContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        leftPanelRef.current &&
        !leftPanelRef.current.contains(event.target) &&
        rightPanelRef.current &&
        !rightPanelRef.current.contains(event.target)
      ) {
        setActivePanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (activePanel && heroRef.current) {
      heroRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activePanel]);

  const handleInputChange = (value) => {
    setElectionID(value);
    console.log("Input Value:", value);
  };

  const handleJoinClick = () => {
    alert(`Input Value: ${electionID}`);
  };

  return (
    <div
      className="mt-14 w-full flex flex-col h-full"
      id="HowFar"
    >
      <TopSection />

      <div
        ref={heroRef}
        className="flex flex-col sm:flex-row justify-center gap-8 p-10 h-fit max-h-[600px] overflow-hidden"
      >
        <Panel
          ref={leftPanelRef}
          activePanel={activePanel}
          setActivePanel={() => setActivePanel("left")}
          handleClick={() => setActivePanel("left")}
          type="left"
          title="Join an Election"
          description="If you already have the ID of your election, just click and type it in to give your anonymous vote. Everything will happen purely in your device."
          fullDescription="Election IDs are actually Mina blockchain smart contract addresses, allowing you to get all the data you need from a distributed set without needing any trusted server."
          fullDescription2="Election ID is usually provided by the election creator. But do not worry if you do not have it, you can also connect your wallet without any risk of losing your privacy."
          buttonText="Join"
          handleJoinClick={handleJoinClick}
          inputPlaceholder="Your election ID"
          onInputChange={handleInputChange}
        />

        <Panel
          ref={rightPanelRef}
          activePanel={activePanel}
          setActivePanel={() => setActivePanel("right")}
          handleClick={() => setActivePanel("right")}
          type="right"
          title="Available Elections"
          description="If you do not know where to start, connect your wallet to see elections that you need to vote for. Do not worry, this will not hurt your privacy in any way."
          fullDescription="Once you connect your wallet, you will have access to all elections that your public key was added to. You can also check other elections and see results from All Elections button."
          fullDescription2="Do not worry, in order not to lose your privacy with a filter, we get all elections out there into the application, and then filter them in your browser for total privacy."
          buttonText={
            minaWalletAddress ? "Already Connected" : "Connect Wallet"
          }
          handleWalletConnect={connectMinaWallet}
          walletAddress={minaWalletAddress}
        />
      </div>
    </div>
  );
};

export default hero;
