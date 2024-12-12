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
  const [blockHash, setBlockHash] = useState<string>('');

  useEffect(() => {
    const communicationLayer = initialData.communication_layers[0];

    if (communicationLayer)
      setBlockHeight(communicationLayer.start_block_height);

    if (communicationLayer && communicationLayer.name === 'Celestia')
      setBlockHash((communicationLayer as types.CelestiaDaLayerInfo).start_block_hash);

  }, [initialData]);

  const handleNext = () => {
    const communicationLayer = initialData.communication_layers[0];

    if (communicationLayer.name == 'Avail' && blockHeight < 0) return;
    if (communicationLayer.name == 'Celestia' && blockHeight < 0 && !blockHash?.trim().length) return;

    if (communicationLayer.name === 'Avail')
      onNext({
        ...initialData,
        communication_layers: [
          {
            ...communicationLayer,
            start_block_height: blockHeight
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
            start_block_hash: blockHash
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
                value={(initialData.communication_layers[0] as types.AvailDaLayerInfo).app_id}
                readOnly
                className='w-full max-w-[620px] h-12 p-2 focus:outline-none bg-[#1E1E1E] text-[#B7B7B7] rounded-[50px] my-4'
              />
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
            (initialData.communication_layers[0].name === 'Avail' && blockHeight < 0) ||
            (initialData.communication_layers[0].name === 'Celestia' && blockHeight < 0 && !blockHash?.trim().length)
          }
          className={`${
            blockHeight <= 0 ||
            (initialData.communication_layers[0].name === 'Avail' && blockHeight < 0) ||
            (initialData.communication_layers[0].name === 'Celestia' && blockHeight < 0 && !blockHash?.trim().length) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
