"use client";
import React from "react";

import { MinaWalletProvider } from "@/contexts/MinaWalletContext";
import { SubwalletProvider } from "@/contexts/SubwalletContext";
import { MetamaskWalletProvider } from "@/contexts/MetamaskWalletContext";
import { SelectedWalletProvider } from "@/contexts/SelectedWalletContext";

export const WalletProvider = ({ children }) => {
  return (
    <SelectedWalletProvider>
      <MinaWalletProvider>
        <MetamaskWalletProvider>
          <SubwalletProvider>
            {children}
          </SubwalletProvider>
        </MetamaskWalletProvider>
      </MinaWalletProvider>
    </SelectedWalletProvider>
  );
};
