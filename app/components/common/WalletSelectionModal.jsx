import React from "react";
import { IoClose } from "react-icons/io5";
import Button from "./Button";

const WalletSelectionModal = ({
  onClose,
  onSelectWallet,
  availableWallets,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-[#141414] rounded-[50px] p-8 shadow-lg w-[400px] h-auto border-[1px] border-primary text-center relative">
      <button
        onClick={onClose}
        className="flex w-full justify-end"
      >
        <IoClose size={28} />
      </button>
      <h3 className="text-xl mb-4">Select Wallet</h3>
      <div className="w-full flex justify-center">
        <div className="flex flex-col space-y-4  w-fit justify-center items-end">
          {availableWallets.includes("Mina") && (
            <Button onClick={() => onSelectWallet("Mina")}>Mina Wallet</Button>
          )}
          {availableWallets.includes("Metamask") && (
            <Button onClick={() => onSelectWallet("Metamask")}>Metamask</Button>
          )}
          {availableWallets.includes("Keplr") && (
            <Button onClick={() => onSelectWallet("Keplr")}>
              Keplr Wallet
            </Button>
          )}
          {availableWallets.includes("Subwallet") && (
            <Button onClick={() => onSelectWallet("Subwallet")}>
              Subwallet
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default WalletSelectionModal;
