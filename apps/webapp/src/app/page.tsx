"use client";

import { LegacyRef, useEffect, useContext, useRef, useState } from "react";

import Panel from "@/app/(partials)/HeroPanel";
import InitialLoadingPage from "@/app/(partials)/InitialLoadingPage";

import { AuroWalletContext } from "@/contexts/AuroWalletContext";

const Page = () => {
  const [activePanel, setActivePanel] = useState<string>("");
  const [electionID, setElectionID] = useState("");
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(true);

  const leftPanelRef: LegacyRef<HTMLDivElement> | undefined = useRef(null);
  const rightPanelRef: LegacyRef<HTMLDivElement> | undefined = useRef(null);
  const heroRef: LegacyRef<HTMLDivElement> | undefined = useRef(null);

  const { auroWalletAddress, connectAuroWallet } =
    useContext(AuroWalletContext);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        !event.target ||
        (leftPanelRef.current &&
          !leftPanelRef.current.contains(event.target as HTMLElement)) ||
        (rightPanelRef.current &&
          !rightPanelRef.current.contains(event.target as HTMLElement))
      ) {
        setActivePanel("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activePanel && heroRef.current) {
      heroRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activePanel]);

  const handleJoinClick = () => {
    alert(`Input Value: ${electionID}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, 2500);

    const exitTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div className="h-full flex flex-col relative">
      <div className="h-full flex flex-col relative">
        <div
          className={`flex flex-col h-full transition-opacity duration-1000 ${
            exiting ? "opacity-100" : "opacity-0"
          }`}
        >
          <main className="flex-grow flex items-start justify-center overflow-hidden">
            <div className="mt-14 w-full flex flex-col h-full" id="HowFar">
              <div className=" flex w-full justify-center pb-[74px]">
                <div className="h-auto flex flex-col justify-center items-center max-w-[760px]  ">
                  <h1 className="text-[64px] md:text-6xl font-montserrat font-medium text-center text-green leading-[1] italic">
                    <span className="text-green">How far </span>
                    <span className="text-white">can it go?</span>
                  </h1>
                  <p className="mt-4 text-center font-hyperlegible text-lightGray text-[16px] leading-[1.375] px-4">
                    With zkVot, we reexplore boundaries of the Internet. Using
                    some of the best technologies out there, zkVot enables
                    censorship-resistant anonymous voting online. Welcome to a
                    new world, where there is no trust.
                  </p>
                </div>
              </div>
              <div
                ref={heroRef}
                className="flex flex-col sm:flex-row justify-center gap-8 p-10 h-fit max-h-[600px] overflow-hidden"
              >
                <Panel
                  ref={leftPanelRef}
                  activePanel={activePanel}
                  // setActivePanel={() => setActivePanel('left')}
                  handleClick={() => setActivePanel("left")}
                  type="left"
                  title="Join an Election"
                  description="If you already have the ID of your election, just click and type it in to give your anonymous vote. Everything will happen purely in your device."
                  fullDescription="Election IDs are actually Mina blockchain smart contract addresses, allowing you to get all the data you need from a distributed set without needing any trusted server."
                  fullDescription2="Election ID is usually provided by the election creator. But do not worry if you do not have it, you can also connect your wallet without any risk of losing your privacy."
                  buttonText="Join"
                  handleJoinClick={handleJoinClick}
                  inputPlaceholder="Your election ID"
                  onInputChange={(value: string) => setElectionID(value)}
                />

                <Panel
                  ref={rightPanelRef}
                  activePanel={activePanel}
                  // setActivePanel={() => setActivePanel('right')}
                  handleClick={() => setActivePanel("right")}
                  type="right"
                  title="Available Elections"
                  description="If you do not know where to start, connect your wallet to see elections that you need to vote for. Do not worry, this will not hurt your privacy in any way."
                  fullDescription="Once you connect your wallet, you will have access to all elections that your public key was added to. You can also check other elections and see results from All Elections button."
                  fullDescription2="Do not worry, in order not to lose your privacy with a filter, we get all elections out there into the application, and then filter them in your browser for total privacy."
                  buttonText={
                    auroWalletAddress ? "Already Connected" : "Connect Wallet"
                  }
                  handleWalletConnect={connectAuroWallet}
                  walletAddress={auroWalletAddress}
                />
              </div>
            </div>
          </main>
        </div>
        {loading && <InitialLoadingPage isExiting={exiting} />}
      </div>
    </div>
  );
};

export default Page;
