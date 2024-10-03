import React from "react";
import WalletItem from "./WalletItem";

const WalletList = ({
  wallets,
  setWallets,
  isTwitterRequired,
  setIsTwitterRequired,
}) => {
  return (
    <div className="w-full flex flex-col space-y-2 items-center">
      {wallets.map((walletData, index) => (
        <WalletItem
          key={index}
          index={index}
          walletData={walletData}
          wallets={wallets}
          setWallets={setWallets}
          isTwitterRequired={isTwitterRequired}
          setIsTwitterRequired={setIsTwitterRequired}
        />
      ))}
    </div>
  );
};

export default WalletList;
