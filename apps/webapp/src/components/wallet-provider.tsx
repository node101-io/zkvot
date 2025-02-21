'use client';

import { ReactNode } from 'react';

// import { MetamaskWalletProvider } from '@/contexts/MetamaskWalletContext.js';
import { AuroWalletProvider } from '@/contexts/auro-wallet-context.jsx';
import { SelectedWalletProvider } from '@/contexts/selected-wallet-context.jsx';
import { SubwalletProvider } from '@/contexts/subwallet-context.jsx';
import { NamadaWalletProvider } from '@/contexts/namada-wallet-context';

export default ({ children }: { children: ReactNode }) => {
  return (
    <SelectedWalletProvider>
      <AuroWalletProvider>
        {/* <MetamaskWalletProvider> */}
        <NamadaWalletProvider>
          <SubwalletProvider>{children}</SubwalletProvider>
        </NamadaWalletProvider>
        {/* </MetamaskWalletProvider> */}
      </AuroWalletProvider>
    </SelectedWalletProvider>
  );
};
