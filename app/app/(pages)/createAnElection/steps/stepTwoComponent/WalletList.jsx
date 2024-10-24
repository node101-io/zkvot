import React from "react";
import WalletItem from "./WalletItem";
const WalletList = ({
  wallets,
  setWallets,
  requiredFields,
  customOptionNames,
}) => {
  return (
    <div className="w-full overflow-y-scroll flex flex-col space-y-2 items-start">
      {wallets.map((walletData, index) => (
        <WalletItem
          key={index}
          index={index}
          walletData={walletData}
          wallets={wallets}
          setWallets={setWallets}
          requiredFields={requiredFields}
          customOptionNames={customOptionNames}
        />
      ))}
    </div>
  );
};

export default WalletList;
