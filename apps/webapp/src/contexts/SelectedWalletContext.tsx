"use client";

import React, { createContext, useState } from "react";

export const SelectedWalletContext = createContext();

export const SelectedWalletProvider = ({ children }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  return (
    <SelectedWalletContext.Provider
      value={{ selectedWallet, setSelectedWallet }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
};
