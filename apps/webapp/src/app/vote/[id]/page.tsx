'use client';

import { useContext, useState, useEffect } from 'react';
import { Election, types, utils } from 'zkvot-core'

import ProgressBar from '@/app/vote/(partials)/progress-bar.jsx';

import VotingStep from '@/app/vote/(steps)/1-voting.jsx';
import SubmissionStep from '@/app/vote/(steps)/2-submission.jsx';
import ResultPage from '@/app/vote/(steps)/3-results.jsx';

import { ToastContext } from '@/contexts/toast-context.jsx';

const MINA_RPC_URL = process.env.NODE_ENV == 'production' ? 'https://api.minascan.io/node/mainnet/v1/graphql' : 'https://api.minascan.io/node/devnet/v1/graphql';

const Page = ({ params }: {
  params: {
    id: string;
  };
}) => {
  const { showToast } = useContext(ToastContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [selectedDA, setSelectedDA] = useState<types.DaLayerInfo['name'] | ''>('');
  const [zkProofData, setZkProofData] = useState<string>('');
  const [electionData, setElectionData] = useState<types.ElectionBackendData>({
    is_devnet: process.env.NODE_ENV === 'production',
    mina_contract_id: '',
    storage_layer_id: '',
    storage_layer_platform: 'A',
    start_date: new Date,
    end_date: new Date,
    question: '',
    options: [],
    description: '',
    image_url: '',
    voters_list: [],
    voters_merkle_root: '0',
    communication_layers: [],
  });

  const fetchElectionData = () =>
    new Promise((resolve: (data: types.ElectionBackendData) => void, reject) => {
      Election.fetchElectionState(params.id, MINA_RPC_URL, (err, election_state) => {
        if (err || !election_state)
          return reject('Failed to fetch election state');

        const storageLayerInfo = utils.decodeStorageLayerInfo(election_state.storageLayerInfoEncoding);

        utils.fetchDataFromStorageLayer(storageLayerInfo, (err, election_static_data) => {
          if (err || !election_static_data)
            return reject('Failed to fetch election data');

          if (utils.verifyElectionDataCommitment(election_static_data, election_state.storageLayerCommitment))
            return reject('Election data commitment verification failed');

          return resolve(utils.convertElectionStaticDataToBackendData(
            process.env.NODE_ENV !== 'production',
            params.id,
            storageLayerInfo.id,
            storageLayerInfo.platform,
            election_static_data
          ));
        });
      });
    }
  );

  const goToNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  useEffect(() => {
    fetchElectionData()
      .then(election_data => {
        setElectionData(election_data);
      })
      .catch((error) => {
        showToast('Failed to fetch election data, please try again later.', 'error');
      });
  }, []);

  return (
    <div className='flex w-full justify-center h-full'>
      <div className='h-full max-w-[1216px] flex flex-col w-full'>
        <ProgressBar
          currentStep={currentStep}
          totalSteps={3}
          loading={loading}
        />
        <div className='w-full h-full pb-12'>
          {currentStep === 1 && (
            <VotingStep
              electionData={electionData}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              goToNextStep={goToNextStep}
              loading={loading}
              setLoading={setLoading}
              setZkProofData={setZkProofData}
            />
          )}
          {currentStep === 2 && (
            <SubmissionStep
              electionData={electionData}
              selectedOption={selectedOption}
              selectedDA={selectedDA}
              setSelectedDA={setSelectedDA}
              goToNextStep={goToNextStep}
              zkProofData={zkProofData}
              setLoading={setLoading}
            />
          )}
          {currentStep === 3 && (
            <ResultPage
              electionData={electionData}
              selectedOption={selectedOption}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
