import { useState, useContext, useEffect } from 'react';

import { types } from 'zkvot-core';

import Button from '@/app/(partials)/button.jsx';

import { ToastContext } from '@/contexts/toast-context.jsx';

import { fetchAvailBlockHeightFromBackend, fetchCelestiaBlockInfoFromBackend } from '@/utils/backend.js';
import { CommunicationLayerDetails } from '@/utils/constants.jsx';
import generateRandomCelestiaNamespace from '@/utils/generateRandomCelestiaNamespace.js';

export default ({ onPrevious, onNext, initialData }: {
  onPrevious: () => void;
  onNext: (data: types.ElectionStaticData) => void;
  initialData: types.ElectionStaticData;
}) => {
  const [selectedCommunicationLayer, setSelectedCommunicationLayer] = useState<'avail' | 'celestia' | null>(null);

  const { showToast } = useContext(ToastContext);

  useEffect(() => setSelectedCommunicationLayer(null), []);

  const handleCommunicationSelection = (layer: 'avail' | 'celestia') => setSelectedCommunicationLayer(layer);

  const handleNext = async () => {
    if (selectedCommunicationLayer == null) return;

    showToast('Fetching communication layer data...', 'success');

    if (selectedCommunicationLayer == 'avail') {
      let communicationLayer: types.AvailDaLayerInfo = {
        name: selectedCommunicationLayer,
        start_block_height: 0,
        app_id: 0
      };

      try {
        communicationLayer.start_block_height = await fetchAvailBlockHeightFromBackend();
        onNext({
          ...initialData,
          communication_layers: [communicationLayer]
        });
      } catch (_) {
        onNext({
          ...initialData,
          communication_layers: [communicationLayer]
        });
      }
    } else if (selectedCommunicationLayer == 'celestia') {
      const communicationLayer: types.CelestiaDaLayerInfo = {
        name: selectedCommunicationLayer,
        start_block_height: 0,
        namespace: generateRandomCelestiaNamespace(),
        start_block_hash: '',
      };

      try {
        const blockInfo = await fetchCelestiaBlockInfoFromBackend();
        communicationLayer.start_block_height = blockInfo.blockHeight;
        communicationLayer.start_block_hash = blockInfo.blockHash;

        onNext({
          ...initialData,
          communication_layers: [communicationLayer]
        });
      } catch (_) {
        onNext({
          ...initialData,
          communication_layers: [communicationLayer]
        });
      };
    }
  };

  return (
    <div className='flex flex-col justify-between items-center h-[calc(100vh-215px)] overflow-y-auto p-4'>
      <div className='w-full space-y-6 p'>
        <h2 className='text-white text-2xl'>Select Communication Layer</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 w-full'>
          {Object.keys(CommunicationLayerDetails).map((layer, index) => (
            <div
              key={index}
              className={`p-4 bg-[#222222] rounded-2xl flex items-center transition duration-200 cursor-pointer ${
                layer === selectedCommunicationLayer
                  ? 'border-[1px] border-primary shadow-lg'
                  : 'hover:bg-[#333333]'
              }`}
              onClick={() => handleCommunicationSelection(layer as 'avail' | 'celestia')}
            >
              <div className='flex-shrink-0 mr-4'>
                {CommunicationLayerDetails[layer as keyof typeof CommunicationLayerDetails].logo || (
                  <div className='w-12 h-12 bg-gray-500 rounded-full' />
                )}
              </div>
              <div className='flex flex-col h-full justify-between'>
                <h3 className='text-white text-[24px] mb-2'>{layer}</h3>
                <p className='text-[16px] mb-2'>
                  {CommunicationLayerDetails[layer as keyof typeof CommunicationLayerDetails].description}
                </p>
                {/* <div className='flex items-center justify-between'>
                  <span className='text-[16px]'>
                    Fee: {CreationData.CommunicationChoicesFee[index]}{' '}
                    {CreationData.CommunicationChoicesCurrency[index]}
                  </span>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='w-full flex justify-between pt-4'>
        <Button onClick={onPrevious}>Previous</Button>
        <Button
          onClick={handleNext}
          disabled={selectedCommunicationLayer === null}
          className={
            selectedCommunicationLayer === null
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }
          // loading={loading}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
