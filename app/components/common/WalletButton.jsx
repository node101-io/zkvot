"use client";
import React, { useContext, useEffect, useState } from "react";
import Button from "./Button";
import Image from "next/image";
import LogoutIcon from "../../assets/Logout.svg";

import MinaIcon from "../../assets/wallets/Mina.png";
import KeplrIcon from "../../assets/wallets/Keplr.svg";
import SubwalletIcon from "../../assets/wallets/Subwallet.svg";
import MetamaskIcon from "../../assets/wallets/Metamask.svg";

import { MinaWalletContext } from "@/contexts/MinaWalletContext";
import { KeplrWalletContext } from "@/contexts/KeplrWalletContext";
import { SubwalletContext } from "@/contexts/SubwalletContext";
import { MetamaskWalletContext } from "@/contexts/MetamaskWalletContext";
import WalletSelectionModal from "../common/WalletSelectionModal";

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
  const {
    metamaskWalletAddress,
    connectMetamaskWallet,
    disconnectMetamaskWallet,
  } = useContext(MetamaskWalletContext);

  const [isClient, setIsClient] = useState(false);
  const [walletConnected, setWalletConnected] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Update the connected wallet and address based on the context values
    if (minaWalletAddress) {
      setWalletConnected("Mina");
      setWalletAddress(minaWalletAddress);
    } else if (keplrWalletAddress) {
      setWalletConnected("Keplr");
      setWalletAddress(keplrWalletAddress);
    } else if (selectedAccount) {
      setWalletConnected("Subwallet");
      setWalletAddress(selectedAccount.address);
    } else if (metamaskWalletAddress) {
      setWalletConnected("Metamask");
      setWalletAddress(metamaskWalletAddress);
    } else {
      setWalletConnected(null);
      setWalletAddress("");
    }
  }, [
    minaWalletAddress,
    keplrWalletAddress,
    selectedAccount,
    metamaskWalletAddress,
  ]);

  const handleConnect = () => {
    // Open the wallet selection modal
    setIsWalletModalOpen(true);
  };

  const handleWalletSelection = async (wallet) => {
    setIsWalletModalOpen(false);

    // Connect to the selected wallet
    if (wallet === "Mina") {
      await connectMinaWallet();
    } else if (wallet === "Metamask") {
      await connectMetamaskWallet();
    } else if (wallet === "Keplr") {
      await connectKeplrWallet();
    } else if (wallet === "Subwallet") {
      await connectSubwallet();
    }
  };

  const handleDisconnect = () => {
    // Disconnect the connected wallet
    if (walletConnected === "Mina") {
      disconnectMinaWallet();
    } else if (walletConnected === "Keplr") {
      disconnectKeplrWallet();
    } else if (walletConnected === "Subwallet") {
      disconnectSubwallet();
    } else if (walletConnected === "Metamask") {
      disconnectMetamaskWallet();
    }
  };

  const formatWalletAddress = (address) => {
    // Format the wallet address to show first 6 and last 4 characters
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (walletName) => {
    switch (walletName) {
      case "Mina":
        return MinaIcon;
      case "Keplr":
        return KeplrIcon;
      case "Subwallet":
        return SubwalletIcon;
      case "Metamask":
        return MetamaskIcon;
      default:
        return null;
    }
  };

  return (
    <>
      {isClient && (
        <div className="flex items-center md:ml-12">
          {walletConnected ? (
            <div className="flex items-center space-x-4 py-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={getWalletIcon(walletConnected)}
                  alt={walletConnected}
                  width={24}
                  height={24}
                />
                <div className="text-white">
                  {formatWalletAddress(walletAddress)}
                </div>
              </div>

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
            <>
              <Button onClick={handleConnect}>Connect Wallet</Button>
              {isWalletModalOpen && (
                <WalletSelectionModal
                  availableWallets={["Mina", "Metamask", "Keplr", "Subwallet"]}
                  onClose={() => setIsWalletModalOpen(false)}
                  onSelectWallet={handleWalletSelection}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default WalletButton;
