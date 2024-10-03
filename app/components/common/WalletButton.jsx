"use client";
import React, { useContext, useEffect, useState } from "react";
import Button from "./Button";
import Image from "next/image";
import LogoutIcon from "../../assets/Logout.svg";

import { MinaWalletContext } from "@/contexts/MinaWalletContext";
import { KeplrWalletContext } from "@/contexts/KeplrWalletContext";
import { SubwalletContext } from "@/contexts/SubwalletContext";

const WalletButton = () => {
  const { minaWalletAddress, connectMinaWallet, disconnectMinaWallet } =
    useContext(MinaWalletContext);
  const { keplrWalletAddress, connectKeplrWallet, disconnectKeplrWallet } =
    useContext(KeplrWalletContext);
  const {
    selectedAccount,
    connectWallet: connectSubwallet,
    disconnectWallet: disconnectSubwallet,
  } = useContext(SubwalletContext);

  const [isClient, setIsClient] = useState(false);
  const [walletConnected, setWalletConnected] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (minaWalletAddress) {
      setWalletConnected("Mina");
      setWalletAddress(minaWalletAddress);
    } else if (keplrWalletAddress) {
      setWalletConnected("Keplr");
      setWalletAddress(keplrWalletAddress);
    } else if (selectedAccount) {
      setWalletConnected("Subwallet");
      setWalletAddress(selectedAccount.address);
    } else {
      setWalletConnected(null);
      setWalletAddress("");
    }
  }, [minaWalletAddress, keplrWalletAddress, selectedAccount]);

  const handleConnect = () => {
    connectMinaWallet();
  };

  const handleDisconnect = () => {
    if (walletConnected === "Mina") {
      disconnectMinaWallet();
    } else if (walletConnected === "Keplr") {
      disconnectKeplrWallet();
    } else if (walletConnected === "Subwallet") {
      disconnectSubwallet();
    }
  };

  return (
    <>
      {isClient && (
        <div className="flex items-center md:ml-12">
          {walletConnected ? (
            <div className="flex items-center space-x-4 py-2">
              <p className="pr-1">{walletConnected}</p>
              <div className="text-white">{walletAddress}</div>

              <button
                onClick={handleDisconnect}
                className="flex items-center space-x-2 hover:opacity-75"
              >
                <Image
                  src={LogoutIcon}
                  alt="Logout"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          ) : (
            <Button onClick={handleConnect}>Connect Wallet</Button>
          )}
        </div>
      )}
    </>
  );
};

export default WalletButton;
