import Image from 'next/image.js';

import ArweaveLogo from '@/public/general/blockchain-logos/arweave.png';
import AvailLogo from '@/public/general/blockchain-logos/avail.png';
import CelestiaLogo from '@/public/general/blockchain-logos/celestia.png';
import FileCoinLogo from '@/public/general/blockchain-logos/filecoin.png';

import { types } from 'zkvot-core';

export type CommunicationLayerDetailsType = {
  [key in types.CommunicationLayerNames]: {
    description: string;
    currency: string;
    logo: JSX.Element;
    submission_methods: Array<'direct' | 'backend'>;
  };
};
export type StorageLayerDetailsType= {
  [key in types.StorageLayerPlatformNames]: {
    description: string;
    currency: string;
    logo: JSX.Element;
    code: types.StorageLayerPlatformCodes;
  };
};

export const CommunicationLayerDetails: CommunicationLayerDetailsType = {
  Avail: {
    description: 'Avail is a decentralized data availability layer.',
    currency: 'AVAIL',
    logo: (
      <Image
        src={AvailLogo}
        alt='Avail Logo'
        width={12}
        height={12}
        className='w-12 h-12'
      />
    ),
    submission_methods: ['direct', 'backend']
  },
  Celestia: {
    description: 'Celestia is a modular consensus and data network.',
    currency: 'TIA',
    logo: (
      <Image
        src={CelestiaLogo}
        alt='Celestia Logo'
        width={12}
        height={12}
        className='w-12 h-12'
      />
    ),
    submission_methods: ['backend']
  }
};
export const StorageLayerDetails: StorageLayerDetailsType= {
  Arweave: {
    description: 'Arweave is a decentralized storage network.',
    currency: 'AR',
    logo: (
      <Image
        src={ArweaveLogo}
        alt='Arweave Logo'
        width={160}
        height={160}
      />
    ),
    code: 'A'
  },
  Filecoin: {
    description: 'Filecoin is a decentralized storage network.',
    currency: 'FIL',
    logo: (
      <Image
        src={FileCoinLogo}
        alt='Filecoin Logo'
        width={160}
        height={160}
      />
    ),
    code: 'F'
  }
};
