'use client';

import {
  PropsWithChildren,
  Dispatch,
  createContext,
  useState,
  SetStateAction,
} from 'react';

type AvailableWallets = 'Auro' | 'Subwallet' | 'Namada';

interface SelectedWalletContextInterface {
  selectedWallet: AvailableWallets | null;
  setSelectedWallet: Dispatch<
    SetStateAction<SelectedWalletContextInterface['selectedWallet']>
  >;
}

export const SelectedWalletContext =
  createContext<SelectedWalletContextInterface>({
    selectedWallet: null,
    setSelectedWallet: () => {},
  });

export const SelectedWalletProvider = ({ children }: PropsWithChildren<{}>) => {
  const [selectedWallet, setSelectedWallet] =
    useState<SelectedWalletContextInterface['selectedWallet']>(null);

  return (
    <SelectedWalletContext.Provider
      value={{ selectedWallet, setSelectedWallet }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
};
