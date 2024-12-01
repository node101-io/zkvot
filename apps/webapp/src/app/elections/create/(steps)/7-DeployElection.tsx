'use client';

import { useContext, useEffect, useState } from 'react';
import Image from 'next/image.js';
import { FaImage } from 'react-icons/fa';
import confetti from 'canvas-confetti';

import { utils } from 'zkvot-core';

import Button from '@/app/(partials)/Button.jsx';
import LoadingOverlay from '@/app/(partials)/LoadingOverlay.jsx';

import ArweaveLogo from '@/public/general/blockchain-logos/arweave.png';
import AvailLogo from '@/public/general/blockchain-logos/avail.png';
import CelestiaLogo from '@/public/general/blockchain-logos/celestia.png';
import FileCoinLogo from '@/public/general/blockchain-logos/filecoin.png';

import Clock from '@/public/elections/partials/clock.jsx';

import { AuroWalletContext } from '@/contexts/AuroWalletContext.jsx';
import { ToastContext } from '@/contexts/ToastContext.jsx';
import { ZKProgramCompileContext } from '@/contexts/ZKProgramCompileContext.jsx';

import { calculateMinaBlockHeightFromTimestampViaBackend } from '@/utils/backend.js';

export default ({ electionData }) => {
  const communicationLayerLogos = {
    avail: <AvailLogo className='w-12 h-12' />,
    celestia: <CelestiaLogo className='w-12 h-12' />,
  };

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { zkappWorkerClient, hasBeenSetup, isSettingUp } =
    useContext(IsCompiledContext);

  const handleSubmit = async () => {
    if (!zkappWorkerClient) {
      console.error('zkappWorkerClient not found');
      return;
    }
    if (isSettingUp) {
      console.error('zkappWorkerClient is still setting up');
      return;
    }
    if (!hasBeenSetup) {
      console.error('zkappWorkerClient has not been setup');
      return;
    }
      setLoading(true);

      try {
        console.log('deploy election starting');
        console.time('deploy election tx');
        const txJson = await zkappWorkerClient.deployElection(
          // Add deployer public key
          calculateBlockHeight(electionData.start_date),
          calculateBlockHeight(electionData.end_date),
          // generateMerkleRootFromVotersList(electionData.voters_list), // TODO: uncomment this line
          {
            first: 1n,
            second: 2n,
          },
          0
        );
        console.timeEnd('deploy election tx');

        const { hash } = await window.mina.sendTransaction({
          transaction: txJson,
          feePayer: {
            fee: 0.1,
            memo: '',
          },
        });

        console.log(`https://minascan.io/devnet/tx/${hash}`);

        confetti({
          particleCount: 100,
          spread: 180,
          origin: { y: 0.6 },
        });
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
      // setSubmitted(true);
  };

  const storageLayerLogos = {
    arweave: (
      <Image src={ArweaveLogo} alt='Arweave Logo' width={48} height={48} />
    ),
    ipfs: <Image src={IPFSLogo} alt='IPFS Logo' width={48} height={48} />,
    filecoin: (
      <Image src={FileCoinLogo} alt='Filecoin Logo' width={48} height={48} />
    ),
  };

  const Placeholder = ({ className }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className='text-gray-500 text-6xl' />
    </div>
  );

  const optionalFields =
    electionData.voters_list && electionData.voters_list.length > 0
      ? Object.keys(electionData.voters_list[0]).filter(
          (key) => key !== 'pubkey'
        )
      : [];

  const [showAllVoters, setShowAllVoters] = useState(false);

  const initialVotersCount = 5;

  const renderCommunicationLayers = () => {
    if (
      !electionData.communication_layers ||
      electionData.communication_layers.length === 0
    ) {
      return <p className='text-gray-500'>No communication layers selected.</p>;
    }

    return electionData.communication_layers.map((layer, index) => (
      <div
        key={index}
        className='flex items-center bg-[#222222] p-4 rounded-2xl mb-4'
      >
        <div className='w-16 h-16 flex-shrink-0 rounded-md mr-4 flex items-center justify-center bg-gray-500'>
          {communicationLayerLogos[layer.type.toLowerCase()] || (
            <div className='w-full h-full bg-gray-500 rounded-md' />
          )}
        </div>
        <div className='flex flex-col'>
          <h3 className='text-white text-lg mb-1 capitalize'>{layer.type}</h3>
          {layer.namespace && (
            <span className='text-sm text-gray-400'>
              Namespace: {layer.namespace}
            </span>
          )}
          {layer.block_height && (
            <span className='text-sm text-gray-400'>
              Block Height: {layer.block_height}
            </span>
          )}
          {layer.block_hash && (
            <span className='text-sm text-gray-400'>
              Block Hash: {layer.block_hash}
            </span>
          )}
        </div>
      </div>
    ));
  };

  const renderStorageLayer = () => {
    if (!electionData.storageLayer) {
      return <p className='text-gray-500'>No storage layer selected.</p>;
    }

    const layer = electionData.storageLayer;
    const logo = layer.name
      ? storageLayerLogos[layer.name.toLowerCase()]
      : null;

    return (
      <div className='flex items-center bg-[#222222] p-4 rounded-2xl mb-4'>
        <div className='w-16 h-16 flex-shrink-0 rounded-md mr-4 flex items-center justify-center bg-gray-500'>
          {logo || <div className='w-full h-full bg-gray-500 rounded-md' />}
        </div>
        <div className='flex flex-col'>
          <h3 className='text-white text-lg mb-1 capitalize'>{layer.name}</h3>
          <span className='text-sm text-gray-400'>
            Description: {layer.description}
          </span>
          <span className='text-sm text-gray-400'>
            Fee: {layer.fee} {layer.currency}
          </span>
        </div>
      </div>
    );
  };

  const renderOptionalFields = (voter) => {
    return optionalFields.map((field, index) => {
      const value = voter[field];
      if (!value) return null;

      return (
        <span
          key={index}
          className='mr-2 text-white text-sm bg-[#1E1E1E] p-3 rounded-full'
        >
          {field}: {value}
        </span>
      );
    });
  };

  const renderVotersList = () => {
    const votersToDisplay = showAllVoters
      ? electionData.voters_list
      : electionData.voters_list.slice(0, initialVotersCount);

    return (
      <>
        <div className='grid grid-cols-1 gap-4'>
          {votersToDisplay.map((voter, index) => (
            <div
              key={index}
              className='flex flex-row justify-between bg-[#222222] p-4 rounded-2xl overflow-scroll'
            >
              <div className='flex items-center mb-2'>
                <span className='text-white text-sm bg-[#1E1E1E] p-2 rounded-full max-w-[530px] overflow-scroll'>
                  {voter.pubkey}
                </span>
              </div>
              <div className='flex items-center '>
                {renderOptionalFields(voter)}
              </div>
            </div>
          ))}
        </div>
        {electionData.voters_list.length > initialVotersCount && (
          <button
            onClick={() => setShowAllVoters(!showAllVoters)}
            className='mt-4 text-white transition underline'
          >
            {showAllVoters ? 'Show Less' : 'Show More'}
          </button>
        )}
      </>
    );
  };

  return (
    <div className='flex flex-col items-center px-4 sm:px-6 md:px-8 h-full'>
      {loading && <LoadingOverlay text='Submitting election' />}
      <div className='pb-4 pt-8 w-full text-start'>Result</div>
      <div className='flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px] '>
        <div className='flex flex-col md:flex-row w-full h-fit'>
          <div className='w-full md:w-1/4 flex'>
            <div className='flex w-full h-32 rounded-3xl overflow-hidden'>
              <div className='w-full relative'>
                {electionData.image_raw ? (
                  <div className='w-full h-full relative'>
                    <Image
                      src={electionData.image_raw}
                      alt='Candidate Image'
                      fill
                      style={{ objectFit: 'cover' }}
                      className='rounded-l-lg'
                    />
                  </div>
                ) : (
                  <Placeholder className='rounded-l-lg' />
                )}
              </div>
            </div>
          </div>
          <div className='px-4 w-full h-fit flex flex-col justify-start'>
            <div className='flex flex-row w-full justify-between '>
              <div className='text-[#B7B7B7] text-sm mb-2 flex flex-row items-center '>
                <span className='flex flex-row justify-center items-center '>
                  <span>
                    <Clock />
                  </span>
                  <span className='text-sm text-[#B7B7B7]'>
                    Start Date:{' '}
                    {new Date(electionData.start_date * 1000).toLocaleString()},
                    End Date:{' '}
                    {new Date(electionData.end_date * 1000).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
            <div className='flex flex-col w-full h-fit '>
              <h2 className='text-2xl mb-2'>{electionData.question}</h2>

              <div className='flex flex-col md:flex-row justify-between py-2 gap-y-1'>
                <span>
                  <span className='text-sm mr-1 flex flex-col items-start'>
                    <span className='text-[16px] italic'>
                      {electionData.description}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='pt-4 pb-2 w-full'>
          <h3 className='text-[16px] text-[#B7B7B7] mb-4'>Options</h3>
          <div className='pl-4 rounded text-[20px]'>
            {electionData.options?.map((option, index) => (
              <div
                key={index}
                className='flex items-center justify-between w-full h-12 px-4 bg-[#333] rounded-[23px] mb-2'
              >
                <span className='text-[16px]'>{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='pt-4 pb-2 w-full'>
        <h3 className='text-[16px] text-[#B7B7B7] mb-4'>Communication Layer</h3>

        <div className='pl-4 rounded text-[20px]'>
          {renderCommunicationLayers()}
        </div>
      </div>

      <div className='pt-4 pb-2 w-full'>
        <h3 className='text-[16px] text-[#B7B7B7] mb-4'>Storage Layer</h3>

        <div className='pl-4 rounded text-[20px]'>{renderStorageLayer()}</div>
      </div>

      <div className='pt-4 pb-2 w-full'>
        <h3 className='text-[16px] text-[#B7B7B7] mb-4'>Voters List</h3>
        {electionData.voters_list && electionData.voters_list.length > 0 ? (
          renderVotersList()
        ) : (
          <p className='text-gray-500'>No voters have participated yet.</p>
        )}
      </div>
      <div className='w-full flex justify-end mt-4'>
        <Button
          onClick={handleSubmit}
          // disabled={submitted}
          className={`${submitted ? 'bg-gray-500 cursor-not-allowed' : ''}`}
        >
          {submitted ? 'Submitted' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};
