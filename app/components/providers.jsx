"use client";
import { KeplrWalletProvider } from "@/contexts/KeplrWalletContext";
import { MinaWalletProvider } from "@/contexts/MinaWalletContext";
import { SubwalletProvider } from "@/contexts/SubwalletContext";
import React from "react";

export const WalletProvider = ({ children }) => {
  return (
    <MinaWalletProvider>
      <KeplrWalletProvider>
        <SubwalletProvider>{children}</SubwalletProvider>
      </KeplrWalletProvider>
    </MinaWalletProvider>
  );
};
