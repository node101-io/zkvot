import { useContext, useState } from 'react';
import Image from 'next/image.js';
import { FaImage } from 'react-icons/fa';
// import confetti from 'canvas-confetti';

import { MerkleTree, types, utils } from 'zkvot-core';

import Button from '@/app/(partials)/Button.jsx';
import LoadingOverlay from '@/app/(partials)/LoadingOverlay.jsx';

import Clock from '@/public/elections/partials/clock-icon.jsx';

import { AuroWalletContext } from '@/contexts/AuroWalletContext.jsx';
import { ToastContext } from '@/contexts/ToastContext.jsx';
import { ZKProgramCompileContext } from '@/contexts/ZKProgramCompileContext.jsx';

import { calculateMinaBlockHeightFromTimestampViaBackend } from '@/utils/backend.js';
import { CommunicationLayerDetails, StorageLayerDetails } from '@/utils/constants.jsx';
import formatDate from '@/utils/formatDate.js';

const DEFAULT_VOTERS_COUNT_TO_DISPLAY = 5;

export default ({ onPrevious, data }: {
  onPrevious: () => void;
  data: {
    election: types.ElectionStaticData;
    storage_layer_platform: types.StorageLayerPlatformCodes,
    storage_layer_id: string
  };
}) => {
  const { auroWalletAddress, connectAuroWallet } = useContext(AuroWalletContext);
  const { showToast } = useContext(ToastContext);
  const { zkProgramWorkerClientInstance, hasBeenSetup, isSettingUp } = useContext(ZKProgramCompileContext);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAllVoters, setShowAllVoters] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (submitted) return;
    if (loading) return;

    if (!auroWalletAddress) await connectAuroWallet();

    if (!auroWalletAddress) {
      showToast('Please connect your wallet to continue.', 'error');
      return;
    };

    if (!zkProgramWorkerClientInstance) {
      showToast('Something went wrong, please try again later.', 'error');
      return;
    }
    if (isSettingUp) {
      showToast('Loading ZK, please wait a few more minutes and try again.', 'error');
      return;
    }
    if (!hasBeenSetup) {
      showToast('Loading ZK, please wait a few more minutes and try again.', 'error');
      return;
    }
    setLoading(true);

    try {
      const minaBlockData = await calculateMinaBlockHeightFromTimestampViaBackend(data.election.start_date, data.election.end_date);
      const votersMerkleTree = MerkleTree.createFromStringArray(data.election.voters_list.map(voter => voter.public_key));

      if (!votersMerkleTree) {
        showToast('Error creating Voters Merkle Tree from voters array.', 'error');
        setLoading(false);
        return;
      };

      const txJson = await zkProgramWorkerClientInstance.deployElection(
        auroWalletAddress,
        minaBlockData.startBlockHeight,
        minaBlockData.endBlockHeight,
        votersMerkleTree.getRoot().toBigInt(),
        utils.encodeStorageLayerInfo(data.storage_layer_platform, data.storage_layer_id)
      );

      const { hash } = await (window as any).mina.sendTransaction({
        transaction: txJson,
        feePayer: {
          fee: 0.1,
          memo: 'Deploy and initialize zkVot Election',
        },
      });

      setLoading(false);

      console.log(`https://minascan.io/devnet/tx/${hash}`);

      // confetti({
      //   particleCount: 100,
      //   spread: 180,
      //   origin: { y: 0.6 },
      // });
    } catch (error) {
      showToast(`Error deploying election, please try again later. Message: ${error}`, 'error');
      setLoading(false);
    }
  };

  const Placeholder = ({ className }: { className: string }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className='text-gray-500 text-6xl' />
    </div>
  );

  const optionalFields = data.election.voters_list?.length > 0 ? Object.keys(data.election.voters_list[0]).filter(key => key !== 'public_key'): [];

  const renderCommunicationLayers = () => {
    return data.election.communication_layers.map((layer, index) => (
      <div
        key={index}
        className='flex items-center bg-[#222222] p-4 rounded-2xl mb-4'
      >
        <div className='w-16 h-16 flex-shrink-0 rounded-md mr-4 flex items-center justify-center bg-gray-500'>
          {CommunicationLayerDetails[layer.name as keyof typeof CommunicationLayerDetails].logo || (
            <div className='w-full h-full bg-gray-500 rounded-md' />
          )}
        </div>
        <div className='flex flex-col'>
          <h3 className='text-white text-lg mb-1 capitalize'>{layer.name}</h3>
          {(layer as types.CelestiaDaLayerInfo).namespace && (
            <span className='text-sm text-gray-400'>
              Namespace: {(layer as types.CelestiaDaLayerInfo).namespace}
            </span>
          )}
          {(layer as types.AvailDaLayerInfo).app_id && (
            <span className='text-sm text-gray-400'>
              Namespace: {(layer as types.AvailDaLayerInfo).app_id}
            </span>
          )}
          {layer.start_block_height && (
            <span className='text-sm text-gray-400'>
              Block Height: {layer.start_block_height}
            </span>
          )}
          {(layer as types.CelestiaDaLayerInfo).start_block_hash && (
            <span className='text-sm text-gray-400'>
              Block Hash: {(layer as types.CelestiaDaLayerInfo).start_block_hash}
            </span>
          )}
        </div>
      </div>
    ));
  };

  const renderStorageLayer = () => {
    const layer = StorageLayerDetails[data.storage_layer_platform as keyof typeof StorageLayerDetails];

    return (
      <div className='flex items-center bg-[#222222] p-4 rounded-2xl mb-4'>
        <div className='w-16 h-16 flex-shrink-0 rounded-md mr-4 flex items-center justify-center bg-gray-500'>
          {layer.logo || <div className='w-full h-full bg-gray-500 rounded-md' />}
        </div>
        <div className='flex flex-col'>
          <h3 className='text-white text-lg mb-1 capitalize'>{data.storage_layer_platform}</h3>
          <span className='text-sm text-gray-400'>
            Description: {layer.description}
          </span>
          {/* <span className='text-sm text-gray-400'>
            Fee: {layer.fee} {layer.currency}
          </span> */}
        </div>
      </div>
    );
  };

  const renderOptionalFields = (voter: types.Voter) => {
    return optionalFields.map((field, index) => {
      const value = voter[field];
      if (!value) return null;

      return (
        <span key={index} className='mr-2 text-white text-sm bg-[#1E1E1E] p-3 rounded-full'>
          {field}: {value}
        </span>
      );
    });
  };

  const renderVotersList = () => {
    const votersToDisplay = showAllVoters ? data.election.voters_list : data.election.voters_list.slice(0, DEFAULT_VOTERS_COUNT_TO_DISPLAY);

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
                  {voter.public_key}
                </span>
              </div>
              <div className='flex items-center'>
                {renderOptionalFields(voter)}
              </div>
            </div>
          ))}
        </div>
        {data.election.voters_list.length > DEFAULT_VOTERS_COUNT_TO_DISPLAY && (
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
      <div className='w-full flex justify-between pt-4'>
        <Button onClick={onPrevious} variant='back'>Previous</Button>
        <Button
          onClick={handleSubmit}
          // disabled={submitted}
          className={`${submitted ? 'bg-gray-500 cursor-not-allowed' : ''}`}
        >
          {submitted ? 'Submitted' : 'Submit'}
        </Button>
      </div>
      <div className='pb-4 pt-8 w-full text-start'>Result</div>
      <div className='flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px] '>
        <div className='flex flex-col md:flex-row w-full h-fit'>
          <div className='w-full md:w-1/4 flex'>
            <div className='flex w-full h-32 rounded-3xl overflow-hidden'>
              <div className='w-full relative'>
                {data.election.image_raw?.length ? (
                  <div className='w-full h-full relative'>
                    <Image.default
                      src={data.election.image_raw}
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
                    {formatDate(data.election.start_date)},
                    End Date:{' '}
                    {formatDate(data.election.end_date)}
                  </span>
                </span>
              </div>
            </div>
            <div className='flex flex-col w-full h-fit '>
              <h2 className='text-2xl mb-2'>{data.election.question}</h2>
              <div className='flex flex-col md:flex-row justify-between py-2 gap-y-1'>
                <span>
                  <span className='text-sm mr-1 flex flex-col items-start'>
                    <span className='text-[16px] italic'>
                      {data.election.description}
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
            {data.election.options.map((option, index) => (
              <div key={index} className='flex items-center justify-between w-full h-12 px-4 bg-[#333] rounded-[23px] mb-2' >
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
        {data.election.voters_list?.length > 0 ? (
          renderVotersList()
        ) : (
          <p className='text-gray-500'>No voters have participated yet.</p>
        )}
      </div>
    </div>
  );
};
