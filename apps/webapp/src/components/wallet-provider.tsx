'use client';

import { ReactNode } from 'react';

// import { MetamaskWalletProvider } from '@/contexts/MetamaskWalletContext.js';
import { AuroWalletProvider } from '@/contexts/auro-wallet-context.jsx';
import { SelectedWalletProvider } from '@/contexts/selected-wallet-context.jsx';
import { SubwalletProvider } from '@/contexts/subwallet-context.jsx';

export default ({ children }: {children: ReactNode}) => {
  return (
    <SelectedWalletProvider>
      <AuroWalletProvider>
        {/* <MetamaskWalletProvider> */}
          <SubwalletProvider>
            {children}
          </SubwalletProvider>
        {/* </MetamaskWalletProvider> */}
      </AuroWalletProvider>
    </SelectedWalletProvider>
  );
};
