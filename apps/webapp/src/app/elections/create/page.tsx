'use client';

import { useState } from 'react';

import { types, utils } from 'zkvot-core';

import ElectionInfoStep from './(steps)/1-ElectionInfo.jsx';
import VotersListStep from './(steps)/2-VotersList.jsx';
import CommLayerSelectionStep from './(steps)/3-CommLayerSelection.jsx';
import CommLayerSubmissionStep from './(steps)/4-CommLayerSubmission.jsx';
import StorageLayerSelectionStep from './(steps)/5-StorageLayerSelection.jsx';
import StorageLayerSubmissionStep from './(steps)/6-StorageLayerSubmission.jsx';
import DeployElectionStep from './(steps)/7-DeployElection.jsx';

import {
  fetchAvailBlockHeightFromBackend,
  fetchCelestiaBlockInfoFromBackend,
} from '@/utils/backend.js';

import generateRandomCelestiaNamespace from '@/utils/generateRandomCelestiaNamespace.js';

const HomePage = () => {
  const [step, setStep] = useState<number>(1);
  const [electionData, setElectionData] = useState<types.ElectionStaticData>({
    start_date: new Date(),
    end_date: new Date(),
    question: '',
    options: [],
    description: '',
    image_raw: '',
    voters_list: [],
    communication_layers: [],
  });
  const [blockHeight, setBlockHeight] = useState('');
  const [blockHash, setBlockHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCommLayerSelectionStepSubmit = async (communicationLayersData) => {
    const selectedLayer = communicationLayersData[0];
    setLoading(true);

    try {
      if (selectedLayer.type === 'celestia') {
        const updatedCommunicationLayer = {
          ...selectedLayer,
          namespace: generateRandomCelestiaNamespace(),
        };
        setElectionData((prevData) => ({
          ...prevData,
          communication_layers: [updatedCommunicationLayer],
        }));

        const data = await fetchCelestiaBlockInfo();
        setBlockHeight(data.blockHeight);
        setBlockHash(data.blockHash);
        setElectionData((prevData) => {
          const updatedData = { ...prevData };
          if (updatedData.communication_layers[0]) {
            updatedData.communication_layers[0].block_height =
              data.blockHeight;
            updatedData.communication_layers[0].block_hash = data.blockHash;
          }
          return updatedData;
        });
      } else if (selectedLayer.type === 'avail') {
        const height = await fetchAvailBlockHeight();
        setBlockHeight(height);
        setElectionData((prevData) => ({
          ...prevData,
          communication_layers: [
            {
              ...selectedLayer,
              block_height: height,
            },
          ],
        }));
      } else {
        setElectionData((prevData) => ({
          ...prevData,
          communication_layers: communicationLayersData,
        }));
      }
      setStep(4);
    } catch (error) {
      console.error('Error during Step Three:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommLayerSubmissionStepSubmit = (additionalData) => {
    setElectionData((prevData) => {
      const updatedData = { ...prevData };
      const communicationLayer = updatedData.communication_layers[0];

      if (communicationLayer.type === 'avail') {
        communicationLayer.app_id = additionalData.app_id;
        communicationLayer.block_height = additionalData.block_height;
      } else if (communicationLayer.type === 'celestia') {
        communicationLayer.block_height = additionalData.block_height;
        communicationLayer.block_hash = additionalData.block_hash;
      }
      return updatedData;
    });

    setStep(5);
  };

  const handleStorageLayerSelectionStepSubmit = (storageLayer) => {
    setElectionData((prevData) => ({
      ...prevData,
      storageLayer: storageLayer,
    }));
    setStep(6);
  };

  const handleStorageLayerSubmissionStepSubmit = (transactionId, setErrorMessage) => {
    let fetchDataFunction;
    switch (electionData.storageLayer.name.toLowerCase().trim()) {
      case 'arweave':
        fetchDataFunction = fetchDataFromArweave;
        break;
      case 'ipfs':
        fetchDataFunction = fetchDataFromIPFS;
        break;
      case 'filecoin':
        fetchDataFunction = fetchDataFromFilecoin;
        break;
      default:
        return;
    }

    setLoading(true);

    fetchDataFunction(transactionId)
      .then((data) => {
        if (data) {
          const updatedData = {
            ...electionData,
            transactionId,
            daData: data,
          };
          setElectionData(updatedData);
          setStep(7);
        } else {
          throw new Error('Data not found for the provided transaction ID.');
        }
      })
      .catch((error) => {
        setErrorMessage(
          error.message || 'An error occurred while fetching data.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCommLayerSubmissionStepPrevious = () => {
    setElectionData((prevData) => ({
      ...prevData,
      communication_layers: [],
    }));
    setStep(3);
  };

  const generateAndDownloadJSON = (currentElectionData) => {
    const finalElectionData = { ...currentElectionData };

    delete finalElectionData.someComponent;
    delete finalElectionData.someEventObject;
    delete finalElectionData.storageLayer;
    console.log('Final Election Data:', finalElectionData);

    downloadJSON(finalElectionData);
  };

  const downloadJSON = (finalElectionData) => {
    if (!finalElectionData) {
      console.error('finalElectionData is undefined or null');
      return;
    }

    delete finalElectionData.someComponent;
    delete finalElectionData.someEventObject;

    console.log('Data to be serialized:', finalElectionData);
    const dataStr = JSON.stringify(finalElectionData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'election_data.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='flex justify-center items-center h-full overflow-y-scroll pb-2'>
      <div className='w-[1062px] h-full p-6 rounded-lg '>
        {step === 1 && (
          <ElectionInfoStep
            onNext={(data: types.ElectionStaticData) => {
              setElectionData(data);
              setStep(2);
            }}
            initialData={electionData}
          />
        )}
        {step === 2 && (
          <VotersListStep
            onPrevious={() => setStep(1)}
            onNext={(data: types.ElectionStaticData) => {
              setElectionData(data);
              setStep(3);
            }}
            initialData={electionData}
          />
        )}
        {step === 3 && (
          <CommLayerSelectionStep
            onPrevious={() => setStep(2)}
            onSubmit={handleCommLayerSelectionStepSubmit}
            loading={loading}
          />
        )}
        {step === 4 && (
          <CommLayerSubmissionStep
            electionData={electionData}
            blockHeight={blockHeight}
            blockHash={blockHash}
            onPrevious={handleCommLayerSubmissionStepPrevious}
            onSubmit={handleCommLayerSubmissionStepSubmit}
          />
        )}
        {step === 5 && (
          <StorageLayerSelectionStep
            electionData={electionData}
            onPrevious={() => setStep(4)}
            onSubmit={handleStorageLayerSelectionStepSubmit}
          />
        )}
        {step === 6 && (
          <StorageLayerSubmissionStep
            electionData={electionData}
            onPrevious={() => setStep(5)}
            onSubmit={handleStorageLayerSubmissionStepSubmit}
            onDownload={() => generateAndDownloadJSON(electionData)}
            isLoading={loading}
          />
        )}
        {step === 7 && (
          <DeployElectionStep
            electionData={electionData}
            onPrevious={() => setStep(6)}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
