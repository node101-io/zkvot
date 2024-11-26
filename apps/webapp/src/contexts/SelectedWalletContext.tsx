'use client';

import { PropsWithChildren, Dispatch, createContext, useState, SetStateAction } from 'react';

export interface SelectedWalletContextInterface {
  selectedWallet: string;
  setSelectedWallet: Dispatch<
    SetStateAction<SelectedWalletContextInterface['selectedWallet']>
  >;
};

export const SelectedWalletContext = createContext<SelectedWalletContextInterface | null>(null);

export const SelectedWalletProvider = ({
  children
}: PropsWithChildren<{}>) => {
  const [selectedWallet, setSelectedWallet] = useState<SelectedWalletContextInterface['selectedWallet']>('');

  return (
    <SelectedWalletContext.Provider
      value={{ selectedWallet, setSelectedWallet }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
};
