"use client";

import { ReactNode } from "react";

// import { MetamaskWalletProvider } from '@/contexts/MetamaskWalletContext.js';
import { AuroWalletProvider } from "@/contexts/AuroWalletContext";
import { SelectedWalletProvider } from "@/contexts/SelectedWalletContext";
import { SubwalletProvider } from "@/contexts/SubwalletContext";

export default ({ children }: { children: ReactNode }) => {
  return (
    <SelectedWalletProvider>
      <AuroWalletProvider>
        {/* <MetamaskWalletProvider> */}
        <SubwalletProvider>{children}</SubwalletProvider>
        {/* </MetamaskWalletProvider> */}
      </AuroWalletProvider>
    </SelectedWalletProvider>
  );
};
