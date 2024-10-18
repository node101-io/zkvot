"use client";
import { KeplrWalletProvider } from "@/contexts/KeplrWalletContext";
import { MinaWalletProvider } from "@/contexts/MinaWalletContext";
import { SubwalletProvider } from "@/contexts/SubwalletContext";
import { MetamaskWalletProvider } from "@/contexts/MetamaskWalletContext";
import React from "react";

export const WalletProvider = ({ children }) => {
  return (
    <MinaWalletProvider>
      <MetamaskWalletProvider>
        <KeplrWalletProvider>
          <SubwalletProvider>{children}</SubwalletProvider>
        </KeplrWalletProvider>
      </MetamaskWalletProvider>
    </MinaWalletProvider>
  );
};
