import Image from 'next/image.js';
import { IoClose } from 'react-icons/io5';

import AuroIcon from '@/public/general/wallet-logos/auro.png';
import SubwalletIcon from '@/public/general/wallet-logos/subwallet.png';
import NamadaIcon from '@/public/general/wallet-logos/namada.png';

type AvailableWallets = 'Auro' | 'Subwallet' | 'Namada';

const WalletSelectionModal = ({
  onClose,
  onSelectWallet,
  availableWallets,
}: {
  onClose: () => void;
  onSelectWallet: (wallet: string) => void;
  availableWallets: AvailableWallets[];
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-[#141414] rounded-[50px] p-8 shadow-lg px-24 py-24 border-[1px] border-primary text-center relative">
      <button
        onClick={onClose}
        className="absolute flex w-full justify-end right-12 top-12"
      >
        <IoClose size={28} />
      </button>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <h3 className="text-xl mb-8">Select Wallet</h3>
        <div
          className={`grid gap-[20px] ${
            availableWallets.length <= 2 ? 'grid-cols-1' : 'grid-cols-2'
          } justify-center`}
        >
          {availableWallets.includes('Auro') && (
            <button
              className="w-[216px] h-[54px] flex justify-start items-center rounded-3xl bg-[#222222] hover:bg-[#333333] text-white hover:text-[#91C1F2] gap-[23px] px-3 transition-colors duration-300"
              onClick={() => onSelectWallet('Auro')}
            >
              <Image src={AuroIcon} alt="Auro Wallet" width={24} height={24} />
              Auro Wallet
            </button>
          )}
          {availableWallets.includes('Subwallet') && (
            <button
              className="w-[216px] h-[54px] flex justify-start items-center rounded-3xl bg-[#222222] hover:bg-[#333333] text-white hover:text-[#4BE8AD] gap-[23px] px-3 transition-colors duration-300"
              onClick={() => onSelectWallet('Subwallet')}
            >
              <Image
                src={SubwalletIcon}
                alt="Subwallet"
                width={24}
                height={24}
              />
              Subwallet
            </button>
          )}
          {availableWallets.includes('Namada') && (
            <button
              className="w-[216px] h-[54px] flex justify-start items-center rounded-3xl bg-[#222222] hover:bg-[#333333] text-white hover:text-[#F2C591] gap-[23px] px-3 transition-colors duration-300"
              onClick={() => onSelectWallet('Namada')}
            >
              <Image
                src={NamadaIcon}
                alt="Namada Wallet"
                width={24}
                height={24}
              />
              Namada Keychain
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default WalletSelectionModal;
