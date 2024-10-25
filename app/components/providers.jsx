"use client";
import { MinaWalletProvider } from "../contexts/MinaWalletContext";
import { SubwalletProvider } from "../contexts/SubwalletContext";
import { MetamaskWalletProvider } from "../contexts/MetamaskWalletContext";
import { SelectedWalletProvider } from "../contexts/SelectedWalletContext";
import React from "react";

export const WalletProvider = ({ children }) => {
  return (
    <SelectedWalletProvider>
      <MinaWalletProvider>
        <MetamaskWalletProvider>
          <SubwalletProvider>{children}</SubwalletProvider>
        </MetamaskWalletProvider>
      </MinaWalletProvider>
    </SelectedWalletProvider>
  );
};
