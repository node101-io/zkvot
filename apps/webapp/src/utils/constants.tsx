import Image from 'next/image.js';

import ArweaveLogo from '@/public/general/blockchain-logos/arweave.png';
import AvailLogo from '@/public/general/blockchain-logos/avail.png';
import CelestiaLogo from '@/public/general/blockchain-logos/celestia.png';
import FileCoinLogo from '@/public/general/blockchain-logos/filecoin.png';

export const CommunicationLayerDetails = {
  avail: {
    description: 'Avail is a decentralized data availability layer.',
    currency: '$AVAIL',
    logo: (
      <Image.default
        src={AvailLogo}
        alt='Avail Logo'
        width={12}
        height={12}
        className='w-12 h-12'
      />
    )
  },
  celestia: {
    description: 'Celestia is a modular consensus and data network.',
    currency: '$TIA',
    logo: (
      <Image.default
        src={CelestiaLogo}
        alt='Celestia Logo'
        width={12}
        height={12}
        className='w-12 h-12'
      />
    )
  },
};

export const StorageLayerDetails = {
  arveawe: {
    description: 'Arweave is a decentralized storage network.',
    currency: 'AR',
    logo: (
      <Image.default
        src={ArweaveLogo}
        alt='Arweave Logo'
        width={160}
        height={160}
      />
    )
  },
  filecoin: {
    description: 'Filecoin is a decentralized storage network.',
    currency: 'FIL',
    logo: (
      <Image.default
        src={FileCoinLogo}
        alt='Filecoin Logo'
        width={160}
        height={160}
      />
    )
  }
}
