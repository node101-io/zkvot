'use client';

import { ReactNode } from 'react';

// import { MetamaskWalletProvider } from '@/contexts/MetamaskWalletContext.js';
import { AuroWalletProvider } from '@/contexts/AuroWalletContext.jsx';
import { SelectedWalletProvider } from '@/contexts/SelectedWalletContext.jsx';
import { SubwalletProvider } from '@/contexts/SubwalletContext.jsx';

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
