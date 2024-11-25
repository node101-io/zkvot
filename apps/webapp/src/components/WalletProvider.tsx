'use client';

import { ReactNode } from 'react';

import { MetamaskWalletProvider } from '@/contexts/MetamaskWalletContext.js';
import { MinaWalletProvider } from '@/contexts/MinaWalletContext.js';
import { SelectedWalletProvider } from '@/contexts/SelectedWalletContext.js';
import { SubwalletProvider } from '@/contexts/SubwalletContext.js';

export default (children: ReactNode) => {
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
