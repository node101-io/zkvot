import { useState, useEffect, useContext } from 'react';

import { types } from 'zkvot-core';

import Button from '@/app/(partials)/button.jsx';

import { SubwalletContext } from '@/contexts/subwallet-context.jsx';
import { ToastContext } from '@/contexts/toast-context.jsx';

const PlusIcon = () => (
  <svg
    width='13'
    height='13'
    viewBox='0 0 13 13'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M12.0547 6.5022L0.941325 6.5022'
      stroke='#AFEEEE'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6.5 0.943359L6.5 12.0567'
      stroke='#AFEEEE'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default ({ onPrevious, onNext, initialData }: {
  onPrevious: () => void;
  onNext: (data: any) => void;
  initialData: types.ElectionStaticData;
}) => {
  const { subwalletAccount, isSubmitting, createAppId, connectSubwallet } = useContext(SubwalletContext);
  const { showToast } = useContext(ToastContext);

  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [appId, setAppId] = useState<number>(0);
  const [blockHash, setBlockHash] = useState<string>('');

  useEffect(() => {
    const communicationLayer = initialData.communication_layers[0];

    if (communicationLayer)
      setBlockHeight(communicationLayer.start_block_height);

    if (communicationLayer && communicationLayer.name === 'Celestia')
      setBlockHash((communicationLayer as types.CelestiaDaLayerInfo).start_block_hash);

  }, [initialData]);

  useEffect(() => {
    setAppId(0)
  }, [subwalletAccount]);

  const handleCreateAppId = async () => {
    if (!subwalletAccount) {
      await connectSubwallet();
    } else {
      try {
        const appId = await createAppId('zkvot-' + Math.random().toString(36).substring(7));

        if (appId) {
          setAppId(appId);
          showToast('App ID created successfully', 'success');
        } else {
          showToast('Invalid App ID data', 'error');
        }
      } catch (error) {
        showToast(`Error creating App ID: ${error}`, 'error');
      }
    }
  };

  const handleNext = () => {
    const communicationLayer = initialData.communication_layers[0];

    if (communicationLayer.name == 'Avail' && appId <= 0) return;
    if (communicationLayer.name == 'Celestia' && !blockHash?.trim().length) return;

    if (communicationLayer.name === 'Avail')
      onNext({
        ...initialData,
        communication_layers: [
          {
            ...communicationLayer,
            start_block_height: blockHeight,
            app_id: appId,
          }
        ]
      });
    if (communicationLayer.name === 'Celestia')
      onNext({
        ...initialData,
        communication_layers: [
          {
            ...communicationLayer,
            start_block_height: blockHeight,
            start_block_hash: blockHash,
          }
        ]
      });
  };

  return (
    <div className='flex flex-col justify-between items-center space-y-6 h-[calc(100vh-215px)] overflow-y-auto p-4'>
      <div className='w-full'>
        <label className='block text-white my-2'>Block Height:</label>
        <input
          type='number'
          value={blockHeight}
          onInput={event => setBlockHeight(Number((event.target as HTMLInputElement).value))}
          className='w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4'
        />
        {initialData.communication_layers[0].name === 'Avail' ?
          (
            <>
              <label className='block text-white'>App ID:</label>
              <input
                type='text'
                value={appId}
                readOnly
                className='w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4'
              />
              <div className='w-full pb-6'>
                <button
                  onClick={handleCreateAppId}
                  disabled={appId > 0 || isSubmitting}
                  className={`px-4 rounded-full py-4 flex flex-row justify-center items-center gap-x-2 transition-colors duration-300 ${
                    isSubmitting || appId > 0
                      ? 'bg-[#333] cursor-not-allowed'
                      : 'bg-[#1E1E1E] hover:bg-[#333]'
                  } text-white rounded`}
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : appId > 0 ? (
                    <>App ID Created</>
                  ) : (
                    <>
                      <PlusIcon />
                      {!subwalletAccount ? 'Connect Wallet' : 'Create App ID'}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <label className='block text-white my-2'>Block Hash:</label>
              <input
                type='text'
                value={blockHash}
                onInput={event => setBlockHash((event.target as HTMLInputElement).value)}
                className='w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4'
              />
            </>
          )
        }
      </div>
      <div className='w-full flex justify-between pt-4'>
        <Button
          onClick={onPrevious}
          variant='back'
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            blockHeight <= 0 ||
            (initialData.communication_layers[0].name === 'Avail' && appId <= 0) ||
            (initialData.communication_layers[0].name === 'Celestia' && !blockHash?.trim().length)
          }
          className={`${
            blockHeight <= 0 ||
            (initialData.communication_layers[0].name === 'Avail' && appId <= 0) ||
            (initialData.communication_layers[0].name === 'Celestia' && !blockHash?.trim().length) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
