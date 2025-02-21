'use client';

import { useContext, useEffect, useState } from 'react';
import Image from 'next/image.js';

import Button from '@/app/(partials)/button.jsx';

import WalletSelectionModal from '@/app/(partials)/wallet-selection-modal.jsx';

import { AuroWalletContext } from '@/contexts/auro-wallet-context.jsx';
import { SelectedWalletContext } from '@/contexts/selected-wallet-context.jsx';
import { SubwalletContext } from '@/contexts/subwallet-context.jsx';
import { NamadaWalletContext } from '@/contexts/namada-wallet-context';

import LogoutIcon from '@/public/general/icons/logout.jsx';

import AuroIcon from '@/public/general/wallet-logos/auro.png';
import SubwalletIcon from '@/public/general/wallet-logos/subwallet.png';
import NamadaIcon from '@/public/general/wallet-logos/namada.png';

const WalletButton = () => {
  const { auroWalletAddress, connectAuroWallet, disconnectAuroWallet } =
    useContext(AuroWalletContext);
  const { selectedWallet, setSelectedWallet } = useContext(
    SelectedWalletContext
  );
  const { subwalletAccount, connectSubwallet, disconnectSubwallet } =
    useContext(SubwalletContext);

  const { namadaWalletAddress, connectNamadaWallet, disconnectNamadaWallet } =
    useContext(NamadaWalletContext);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!!auroWalletAddress.trim().length) setSelectedWallet('Auro');
    else if (!!subwalletAccount?.address.trim().length)
      setSelectedWallet('Subwallet');
    else if (!!namadaWalletAddress.trim().length) setSelectedWallet('Namada');
  }, [auroWalletAddress, subwalletAccount, namadaWalletAddress]);

  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletSelection = async (wallet: string) => {
    setIsWalletModalOpen(false);

    if (wallet === 'Auro') {
      await connectAuroWallet();
      setSelectedWallet('Auro');
    } else if (wallet === 'Subwallet') {
      await connectSubwallet();
      setSelectedWallet('Subwallet');
    } else if (wallet === 'Namada') {
      await connectNamadaWallet();
      setSelectedWallet('Namada');
    }
  };

  const handleDisconnect = () => {
    if (selectedWallet === 'Auro') {
      disconnectAuroWallet();
      setSelectedWallet(null);
    } else if (selectedWallet === 'Subwallet') {
      disconnectSubwallet();
      setSelectedWallet(null);
    } else if (selectedWallet === 'Namada') {
      disconnectNamadaWallet();
      setSelectedWallet(null);
    }
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (wallet: string) => {
    switch (wallet) {
      case 'Auro':
        return AuroIcon;
      case 'Subwallet':
        return SubwalletIcon;
      case 'Namada':
        return NamadaIcon;
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center">
      {selectedWallet ? (
        <div className="flex items-center space-x-4 py-2">
          <div className="flex items-center space-x-2">
            <Image
              src={getWalletIcon(selectedWallet)}
              alt={selectedWallet}
              width={26}
              height={26}
              className="rounded-full"
            />
            <div className="text-white">
              {formatWalletAddress(
                selectedWallet === 'Auro'
                  ? auroWalletAddress
                  : subwalletAccount?.address || ''
              )}
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="flex items-center space-x-2 hover:opacity-75"
          >
            <LogoutIcon />
          </button>
        </div>
      ) : (
        <>
          <Button onClick={handleConnect}>Connect Wallet</Button>
          {isWalletModalOpen && (
            <WalletSelectionModal
              availableWallets={['Auro', 'Subwallet', 'Namada']}
              onClose={() => setIsWalletModalOpen(false)}
              onSelectWallet={handleWalletSelection}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WalletButton;
