'use client';

import Image from 'next/image.js';

import { types } from 'zkvot-core';

import { useRouter } from 'next/navigation';
import Button from '@/app/(partials)/button';
import SuccessIcon from '@/public/general/icons/Success.svg';

export default ({ electionData }: { electionData: types.ElectionBackendData; }) => {
  const router = useRouter();

  const handleViewResults = () => {
    router.push(`/results/${electionData.mina_contract_id}`);
  };

  return (
    <div className='flex flex-col p-4'>
      <div className='bg-[#1B1B1B] rounded-3xl shadow-2xl p-6 w-full text-center'>
        <div className='flex justify-center mb-6'>
          <Image
            src={SuccessIcon}
            alt='Success Illustration'
            width={80}
            height={80}
          />
        </div>

        <h2 className='text-xl text-white mb-4 animate-fade-in'>
          Thank You for Voting!
        </h2>

        <p className='text-gray-300 mb-2'>
          Your vote for <span className='font-semibold text-white'>{`"${electionData.question}"`}</span> has been successfully submitted.
        </p>
        <p className='text-gray-300 mb-2'>
          Please note that it may take some time until your vote is counted.
        </p>
        <p className='text-gray-300 mb-6'>
          Election ID: <span className='font-semibold text-white'>{`${electionData.mina_contract_id}`}</span>
        </p>

        <Button
          onClick={handleViewResults}
          className=" text-white py-2 px-4 transition duration-300"
          aria-label="View Election Results"
        >
          View Results
        </Button>
      </div>
    </div>
  );
};
