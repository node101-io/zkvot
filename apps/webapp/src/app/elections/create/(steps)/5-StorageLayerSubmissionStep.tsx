'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image.js';
import Link from 'next/link.js';

import { types, utils } from 'zkvot-core';

import Button from '@/app/(partials)/Button.jsx';

import SignUpImage from '@/public/StepFiveTutorial/AkordSignUp.svg';
import SetUpVaultImage from '@/public/StepFiveTutorial/AkordSetUpVault.svg';
import CreateVaultImage from '@/public/StepFiveTutorial/AkordCreateVault.svg';
import UploadFileImage from '@/public/StepFiveTutorial/AkordUploadFile.svg';
import DownloadFileImage from '@/public/StepFiveTutorial/AkordDownloadUploadFile.svg';
import FileContentImage from '@/public/StepFiveTutorial/AkordFileContent.svg';
import CopyFromFileImage from '@/public/StepFiveTutorial/AkordCopyFromFile.svg';

const StepSix = ({ electionData, onPrevious, onSubmit, onDownload }: {
  electionData: types.ElectionFrontendData;
  onPrevious: () => void;
  onSubmit: (data: any, setError: (error: string) => void) => Promise<void>;
  onDownload: () => void;
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);

  const stepsData = getStepsData(electionData.storage_layer_platform, onDownload);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTransactionId(e.target.value);
    setIsSubmitEnabled(e.target.value.trim() !== '');
    setErrorMessage('');
  };

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      setIsFetchingData(true);

      Promise.resolve(onSubmit(transactionId.trim(), setErrorMessage))
        .then(() => {
          console.log('Submission successful.');
        })
        .catch((error) => {
          console.error('Submission error:', error);
          const errorMessageToDisplay =
            error.message || 'An error occurred during submission.';
          setErrorMessage(errorMessageToDisplay);
          console.log('Displaying error message:', errorMessageToDisplay);
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    }
  };

  return (
    <div className='flex flex-col items-start space-y-6'>
      <h2 className='text-white text-2xl'>
        Guide
      </h2>
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
      <div className='w-full'>
        <label className='block text-white mb-2'>Transaction ID</label>
        <input
          type='text'
          value={transactionId}
          onChange={handleInputChange}
          className='w-full h-12 p-2 bg-[#222] text-white rounded-[23px] border'
          placeholder='Enter your transaction ID here'
        />
      </div>
      {errorMessage && <p className='text-red-500 mt-2'>{errorMessage}</p>}

      {isFetchingData && (
        <p className='text-white mt-2'>Submitting data, please wait...</p>
      )}

      <div className='w-full flex justify-between pt-4'>
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled || isFetchingData}
          className={
            !isSubmitEnabled || isFetchingData
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepSix;

function getStepsData(
  storageLayer: (typeof utils.Platforms)[keyof typeof utils.Platforms],
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
          image: SignUpImage,
        },
        {
          text: (
            <>
              2. After you sign up, sign in. You will see the following page,
              choose “NFT assets / public archives” and click “Setup vault”.
            </>
          ),
          image: SetUpVaultImage,
        },
        {
          text: '3. Give it a title and click “Create vault”.',
          image: CreateVaultImage,
        },
        {
          text: '4. Click “Upload a file”.',
          image: UploadFileImage,
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
          image: DownloadFileImage,
        },
        {
          text: '6. Click on the file you uploaded to see its content.',
          image: FileContentImage,
        },
        {
          text: (
            <>
              7. Click on “info” button on the right to see the file info. Copy
              the URL starting with “https://arweave.net” and paste it into the
              field below.
            </>
          ),
          image: CopyFromFileImage,
        },
      ];
    case 'P':
      return [];
    case 'F':
      return [];
    default:
      return [];
  }
};
