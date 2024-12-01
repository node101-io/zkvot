'use client';

import { useContext, useState, ChangeEvent } from 'react';
import Image from 'next/image.js';
import Link from 'next/link.js';

import { types, utils } from 'zkvot-core';

import Button from '@/app/(partials)/Button.jsx';

import { ToastContext } from '@/contexts/ToastContext.jsx';

import ArweaveStep1Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-1.png';
import ArweaveStep2Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-2.png';
import ArweaveStep3Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-3.png';
import ArweaveStep4Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-4.png';
import ArweaveStep5Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-5.png';
import ArweaveStep6Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-6.png';
import ArweaveStep7Image from '@/public/elections/storage-layer-upload-instructions/arweave/step-7.png';

import FilecoinStep1Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-1.png';
import FilecoinStep2Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-2.png';
import FilecoinStep3Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-3.png';
import FilecoinStep4Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-4.png';
import FilecoinStep5Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-5.png';
import FilecoinStep6Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-6.png';
import FilecoinStep7Image from '@/public/elections/storage-layer-upload-instructions/filecoin/step-7.png';

export default ({ onPrevious, onNext, initialData }: {
  onPrevious: () => void;
  onNext: (data: {
    election: types.ElectionStaticData,
    storage_layer_platform: types.StorageLayerPlatformCodes,
    storage_layer_id: string
  }) => void;
  initialData: {
    election: types.ElectionStaticData,
    storage_layer_platform: types.StorageLayerPlatformCodes
  };
}) => {
  const { showToast } = useContext(ToastContext);

  const [transactionId, setTransactionId] = useState<string>('');

  const handleSubmit = () => {
    if (!transactionId.trim().length) {
      showToast('Please enter a transaction ID.', 'error');
      return;
    }

    onNext({
      election: initialData.election,
      storage_layer_platform: initialData.storage_layer_platform,
      storage_layer_id: transactionId
    });
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(initialData.election, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'zkvot-election-data.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stepsData = getUploadInstructions(initialData.storage_layer_platform, downloadJSON);

  return (
    <div className='flex flex-col items-start space-y-6'>
      <h2 className='text-white text-2xl'>
        Storage Layer Upload Guide
      </h2>
      <div className='w-full'>
        <label className='block text-white mb-2'>Transaction ID</label>
        <input
          type='text'
          value={transactionId}
          onChange={event => setTransactionId(event.target.value)}
          className='w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border'
          placeholder='Enter your transaction ID here'
        />
      </div>
      <div className='w-full flex justify-between pt-4'>
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={!transactionId.trim().length}
          className={
            !transactionId.trim().length
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }
        >
          Next
        </Button>
      </div>
      <div className='w-full text-white'>
        {stepsData.map((step, index) => (
          <div key={index}>
            <div className='mb-4'>{step.text}</div>
            <Image.default
              src={step.image}
              className='mb-6'
              alt=''
              width={1000}
              height={530}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function getUploadInstructions(
  storageLayer: (typeof utils.StorageLayerPlatformEncoding)[keyof typeof utils.StorageLayerPlatformEncoding],
  onDownload: () => void
) {
  switch (storageLayer) {
    case 'A':
      return [
        {
          text: (
            <>
              1. Go to
              <Link.default
                className='text-blue-400'
                href={'https://v2.akord.com/signup'}
              >
                {' '}
                https://v2.akord.com/signup{' '}
              </Link.default>
              and create an account.
            </>
          ),
          image: ArweaveStep1Image,
        },
        {
          text: '2. After you sign up, sign in. You will see the following page, choose “NFT assets / public archives” and click “Setup vault”.',
          image: ArweaveStep2Image,
        },
        {
          text: '3. Give it a title and click “Create vault”.',
          image: ArweaveStep3Image,
        },
        {
          text: '4. Click “Upload a file”.',
          image: ArweaveStep4Image,
        },
        {
          text: (
            <>
              <div>
                5.{' '}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDownload();
                  }}
                  className='hover:text-white/70 underline'
                >
                  Download
                </button>{' '}
                the file here and upload it to the website.
              </div>
            </>
          ),
          image: ArweaveStep5Image,
        },
        {
          text: '6. Click on the file you uploaded to see its content.',
          image: ArweaveStep6Image,
        },
        {
          text: '7. Click on “info” button on the right to see the file info. Copy the URL starting with “https://arweave.net” and paste it into the input above',
          image: ArweaveStep7Image,
        },
      ];
    case 'P':
      return [];
    case 'F':
      return [
        {
          text: (
            <>
              1. Go to
              <Link.default
                className='text-blue-400'
                href={'https://console.storacha.network/'}
              >
                {' '}
                https://console.storacha.network/{' '}
              </Link.default>
              and create an account.
            </>
          ),
          image: FilecoinStep1Image,
        },
        {
          text: '2. Subscribe to free plan and create a space.',
          image: FilecoinStep2Image,
        },
        {
          text: '3. You’ll see the following page. Click on the space you created then “Upload a file”.',
          image: FilecoinStep3Image,
        },
        {
          text: (
            <>
              <div>
                4.{' '}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDownload();
                  }}
                  className='hover:text-white/70 underline'
                >
                  Download
                </button>{' '}
                the file here and upload it to the website.
              </div>
            </>
          ),
          image: FilecoinStep4Image,
        },
        {
          text: '5. Uncheck “Wrap in directory” checkbox. Then click “Start Upload”.',
          image: FilecoinStep5Image,
        },
        {
          text: '6. Wait for some time for it to be uploaded. Then, click the logo on top left and select the space you created.',
          image: FilecoinStep6Image,
        },
        {
          text: '7. Copy the Root CID of your data and paste it in the above input.',
          image: FilecoinStep7Image,
        },
      ];
    default:
      return [];
  }
};