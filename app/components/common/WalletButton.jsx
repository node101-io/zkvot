"use client";
import React, { useContext, useEffect, useState } from "react";
import Button from "./Button";
import Image from "next/image";
import LogoutIcon from "../../assets/Logout.svg";

import MinaIcon from "../../assets/wallets/Mina.png";
import SubwalletIcon from "../../assets/wallets/Subwallet.svg";
import MetamaskIcon from "../../assets/wallets/Metamask.svg";

import { MinaWalletContext } from "../../contexts/MinaWalletContext";
import { SubwalletContext } from "../../contexts/SubwalletContext";
import { MetamaskWalletContext } from "../../contexts/MetamaskWalletContext";
import WalletSelectionModal from "../common/WalletSelectionModal";
import { SelectedWalletContext } from "../../contexts/SelectedWalletContext";

const WalletButton = () => {
  const { minaWalletAddress, connectMinaWallet, disconnectMinaWallet } =
    useContext(MinaWalletContext);
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

  const { selectedWallet, setSelectedWallet } = useContext(
    SelectedWalletContext
  );

  const [isClient, setIsClient] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (minaWalletAddress) {
      setSelectedWallet("Mina");
      setWalletAddress(minaWalletAddress);
    } else if (selectedAccount) {
      setSelectedWallet("Subwallet");
      setWalletAddress(selectedAccount.address);
    } else if (metamaskWalletAddress) {
      setSelectedWallet("Metamask");
      setWalletAddress(metamaskWalletAddress);
    } else {
      setSelectedWallet(null);
      setWalletAddress("");
    }
  }, [
    minaWalletAddress,
    selectedAccount,
    metamaskWalletAddress,
    setSelectedWallet,
  ]);

  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletSelection = async (wallet) => {
    setIsWalletModalOpen(false);

    if (wallet === "Mina") {
      await connectMinaWallet();
    } else if (wallet === "Metamask") {
      await connectMetamaskWallet();
    } else if (wallet === "Subwallet") {
      await connectSubwallet();
    }
  };

  const handleDisconnect = () => {
    if (selectedWallet === "Mina") {
      disconnectMinaWallet();
    } else if (selectedWallet === "Subwallet") {
      disconnectSubwallet();
    } else if (selectedWallet === "Metamask") {
      disconnectMetamaskWallet();
    }
  };

  const formatWalletAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (walletName) => {
    switch (walletName) {
      case "Mina":
        return MinaIcon;
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
          {selectedWallet ? (
            <div className="flex items-center space-x-4 py-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={getWalletIcon(selectedWallet)}
                  alt={selectedWallet}
                  width={26}
                  height={26}
                  className="rounded-full"
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
                  availableWallets={["Mina", "Metamask", "Subwallet"]}
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
