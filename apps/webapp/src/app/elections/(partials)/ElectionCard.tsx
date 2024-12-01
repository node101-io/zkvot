import React from 'react';
import Image from 'next/image.js';
import Link from 'next/link.js';
import { FaImage } from 'react-icons/fa';

import { types } from 'zkvot-core'

import Button from '@/app/(partials)/Button.jsx';
import CopyButton from '@/app/(partials)/CopyButton.jsx';
import DateFormatter from '@/app/(partials)/DateFormatter.jsx';
import ToolTip from '@/app/(partials)/ToolTip.jsx';

import Clock from '@/public/elections/partials/clock.jsx';
import LearnMoreIcon from '@/public/elections/partials/learn-more-icon.jsx';

const ElectionCard = ({
  electionData,
  isLoading
}: {
  electionData?: types.ElectionBackendData;
  isLoading: boolean;
}) => {
  if (isLoading || !electionData)
    return (
      <div className='bg-[#1C1C1E] text-white rounded-lg shadow-md overflow-hidden animate-pulse'>
        <div className='p-4'>
          <div className='relative aspect-w-16 aspect-h-9 mb-4'>
            <div className='flex w-full h-full'>
              <div className='w-1/2 h-full bg-[#121315] rounded-l-lg'></div>
              <div className='w-1/2 h-full bg-[#121315] rounded-r-lg'></div>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='h-5 bg-[#121315] rounded w-3/4'></div>
            <div className='h-5 bg-[#121315] rounded w-1/2'></div>
            <div className='h-7 bg-[#121315] rounded w-full'></div>
            <div className='h-5 bg-[#121315] rounded w-full'></div>
            <div className='h-5 bg-[#121315] rounded w-5/6'></div>
            <div className='h-5 bg-[#121315] rounded w-2/3'></div>
          </div>
        </div>
      </div>
    );

  const Placeholder = ({ className }: {
    className: string;
  }) => (
    <div className={`${className} flex items-center justify-center  h-full`}>
      <FaImage className='text-gray-500 text-6xl' />
    </div>
  );

  return (
    <div className='bg-[#222222] max-w-[457px] min-w-[456px] text-white rounded-xl shadow-md overflow-visible'>
      <div className='p-4'>
        <div className='relative mb-4'>
          <div className='flex w-full h-full'>
            <div className='w-[417px] h-[214px] relative rounded-xl overflow-hidden'>
              {electionData.image_url.length ? (
                <Image.default
                  src={electionData.image_url}
                  alt='Candidate 1'
                  fill
                  className='rounded-l-lg object-cover'
                />
              ) : (
                <Placeholder className='rounded-l-lg' />
              )}
            </div>
          </div>
        </div>
        <div className='text-green-400 text-sm mb-1 flex justify-between'>
          {/* <span className='flex flex-row items-center'>
            <span className='text-primary mr-1 italic text-sm'>zkVote by</span>
            {electionData.zkvoteBy
              ? electionData.zkvoteBy.slice(0, 12) + '...'
              : 'Unknown'}
            <span className='ml-1 cursor-pointer w-fit'>
              <CopyButton
                textToCopy={electionData.zkvoteBy}
                iconColor='#F6F6F6'
                position={{ top: -16, left: -38 }}
              />
            </span>
          </span> */}
          <span className='flex flex-row justify-center items-center'>
            <span>
              <Clock/>
            </span>
            <span className='ml-1 text-sm text-[#B7B7B7]'>
              <DateFormatter date={electionData.start_date} />
            </span>
          </span>
        </div>
        <div className='text-[#B7B7B7] text-sm mb-2 flex flex-row items-center'>
          <span className='mr-2'>
            <ToolTip
              content='It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
              position='top'
              arrowPosition='start'
            >
              <LearnMoreIcon color='#B7B7B7' />
            </ToolTip>
          </span>
          Election id: {String(electionData.mina_contract_id).slice(0, 12) + '...'}
          <span className='ml-1 cursor-pointer w-fit'>
            <CopyButton
              textToCopy={electionData.mina_contract_id}
              iconColor='#F6F6F6'
              position={{ top: -16, left: -38 }}
            />
          </span>
        </div>
        <h2 className='text-[24px] mb-2'>{electionData.question}</h2>
        <p className='text-[#B7B7B7] italic mb-4'>{electionData.description}</p>
        <div className='flex justify-between items-center translate-x-2'>
          <button className='relative inline-flex items-center  py-3 font-medium text-gray-300 transition duration-300 ease-out group hover:-translate-y-1 hover:text-white'>
            See Results
          </button>
          <Link.default href={`/vote/${electionData.mina_contract_id}`}>
            <Button>Vote</Button>
          </Link.default>
        </div>
      </div>
    </div>
  );
};

export default ElectionCard;
