'use client';

import { ReactNode } from 'react';

// import { MetamaskWalletProvider } from '@/contexts/MetamaskWalletContext.js';
import { AuroWalletProvider } from '@/contexts/AuroWalletContext.js';
import { SelectedWalletProvider } from '@/contexts/SelectedWalletContext.js';
import { SubwalletProvider } from '@/contexts/SubwalletContext.js';

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
