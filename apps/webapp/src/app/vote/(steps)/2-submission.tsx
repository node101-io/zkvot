'use client';

import { useContext, useState } from 'react';
import Image from 'next/image.js';
import { FaImage } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

import { types } from 'zkvot-core';

import Button from '@/app/(partials)/button.jsx';
import CopyButton from '@/app/(partials)/copy-button.jsx';
import ToolTip from '@/app/(partials)/tool-tip.jsx';

import { SubwalletContext } from '@/contexts/subwallet-context.jsx';
import { ToastContext } from '@/contexts/toast-context.jsx';

import { sendVoteViaBackend } from '@/utils/backend.js';
import { CommunicationLayerDetails } from '@/utils/constants.jsx';

import LearnMoreIcon from '@/public/elections/partials/learn-more-icon.jsx';
import Clock from '@/public/elections/partials/clock-icon.jsx';

const ModeSelection = ({ selectionMode, setSelectionMode }: {
  selectionMode: string;
  setSelectionMode: (mode: 'direct' | 'backend') => void;
}) => {
  return (
    <div className='flex mb-6 w-full space-x-4'>
      <button
        onClick={() => setSelectionMode('backend')}
        className={`focus:outline-none flex items-center gap-2 border-b-[1px] pb-1 ${selectionMode === 'backend'
          ? 'text-white border-primary'
          : 'text-[#B7B7B7] border-transparent hover:border-[#B7B7B7]'
        }`}
      >
        Through Our Backends (Free of Charge)
        <ToolTip
          content='By allowing to submit your votes to the DA through our backend ports, we eliminate any risk of identity exposure related to your DA wallet address (plus it is free :D). However, this option is only partially decentralized, as you rely on our backend servers. In the future, zkVot will also allow custom parties to host their own backend servers to maximize decentralization.'
          position='top'
          arrowPosition='start'
        >
          <LearnMoreIcon color='#B7B7B7' />
        </ToolTip>
      </button>
      <button
        onClick={() => setSelectionMode('direct')}
        className={`focus:outline-none flex items-center gap-2 border-b-[1px] pb-1 ${selectionMode === 'direct'
          ? 'text-white pb-1 border-primary'
          : 'text-[#B7B7B7] border-transparent hover:border-[#B7B7B7]'
        }`}
      >
        Directly Through DA
        <ToolTip
          content='Sending through DA yourself eliminates any risk of censorship during the vote submission process. However, be careful using this option, as your vote is associated with the wallet address you use in the DA layer once you submit it. You can use a private network to anonymize your funds.'
          position='top'
          arrowPosition='start'
        >
          <LearnMoreIcon color='#B7B7B7' />
        </ToolTip>
      </button>
    </div>
  );
};

const DASelection = ({
  communicationLayers,
  selectedDA,
  setSelectedDA,
  isSubmitting,
  selectionMode,
  downloadVoteProof,
}: {
  communicationLayers: types.DaLayerInfo[];
  selectedDA: types.DaLayerInfo['name'];
  setSelectedDA: (da: types.DaLayerInfo['name']) => void;
  isSubmitting: boolean;
  selectionMode: 'direct' | 'backend';
  downloadVoteProof: () => void;
}) => {
  const renderCelestiaDirectSubmissionInfo = () => (
    <div className='mt-6'>
      zkVot doesn't support direct submission to Celestia yet. You can{" "}
      <button
        onClick={(e) => {
          e.preventDefault();
          downloadVoteProof();
        }}
        className="text-primary"
      >
        download
      </button>{" "}
      your vote and submit it manually from{" "}
      <a
        href="https://celenium.io/"
        target="_blank"
        className="text-primary"
        rel="noopener noreferrer"
      >
        celenium.io
      </a>{" "}
      website.
    </div>
  );

  const renderLayerGrid = () => (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${
        isSubmitting ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      }`}
    >
      {communicationLayers.map(layer => (
        <div
          key={layer.name}
          className={`p-4 bg-[#222222] rounded-2xl cursor-pointer flex items-center border-[1px] transition duration-200 ${
            selectedDA === layer.name || communicationLayers.length === 1
              ? "border-primary shadow-lg"
              : "border-transparent hover:bg-[#333333]"
          }`}
          onClick={() => !isSubmitting && setSelectedDA(layer.name)}
        >
          <div className="flex-shrink-0 mr-4">
            {CommunicationLayerDetails[layer.name].logo || (
              <div className="w-12 h-12 bg-gray-500 rounded-full" />
            )}
          </div>
          <div className="flex flex-col h-full justify-between">
            <h3 className="text-white text-[24px] mb-2">
              {layer.name.charAt(0).toUpperCase() + layer.name.slice(1)}
            </h3>
            <p className="text-[16px] mb-2">
              {CommunicationLayerDetails[layer.name].description ||
                "No description available."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {renderLayerGrid()}
      {selectionMode === "direct" && selectedDA === "Celestia"
        ? renderCelestiaDirectSubmissionInfo(): null}
    </>
  );
};

export default ({
  electionData,
  selectedOption,
  goToNextStep,
  goToPrevStep,
  zkProofData,
  setLoading,
}: {
  electionData: types.ElectionBackendData;
  selectedOption: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  zkProofData: string;
  setLoading: (loading: boolean) => void;
}) => {
  const { subwalletAccount, connectSubwallet, submitDataToAvailViaSubwallet, isSubmitting } = useContext(SubwalletContext);
  const { showToast } = useContext(ToastContext);

  electionData.communication_layers = [
    {
      name: 'Avail',
      start_block_height: 123,
      app_id: 123
    },
    {
      name: 'Celestia',
      namespace: 'fldsşd',
      start_block_height: 123,
      start_block_hash: 'fldsşigd'
    }
  ];

  const [selectionMode, setSelectionMode] = useState<'direct' | 'backend'>('backend');
  const [selectedDA, setSelectedDA] = useState<types.DaLayerInfo['name']>(electionData.communication_layers[0].name);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isPopupConfirmed, setIsPopupConfirmed] = useState<boolean>(false);

  const downloadVoteProof = () => {
    const blob = new Blob([zkProofData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'zkvot-vote-proof-' + electionData.mina_contract_id + '.txt';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConnectWallet = async () => {
    try {
      console.log('Connecting wallet...');
      await connectSubwallet();
      console.log('Wallet connection initiated.');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showToast('Failed to connect wallet. Please try again', 'error');
    }
  };

  const handlePopupConfirm = () => {
    setIsPopupConfirmed(true);
    setIsPopupOpen(false);
    handleNext();
  };

  const handleNext = async () => {
    if (!selectedDA) {
      showToast('Please select a DA Layer to proceed', 'error');
      return;
    }

    if (selectionMode === 'direct') {
      if (selectedDA === 'Avail' && !subwalletAccount) {
        if (!subwalletAccount) {
          showToast('Please connect your wallet to proceed', 'error');
          return;
        }
        if (!zkProofData) {
          showToast('No vote proof found', 'error');
          return;
        }
      } else if (selectedDA === 'Celestia') {
        if (isPopupConfirmed)
          goToNextStep();
        else
          setIsPopupOpen(true);
        return;
      }
    } else if (selectionMode === 'backend') {
      if (!zkProofData) {
        showToast('ZK proof data is missing. Please go back and generate it.', 'error');
        return;
      }
    }

    try {
      setLoading(true);

      if (selectionMode === 'direct') {
        let transactionSuccess = false;

        if (selectedDA === 'Avail')
          transactionSuccess = await submitDataToAvailViaSubwallet(zkProofData);

        if (transactionSuccess)
          goToNextStep();
        else
          throw new Error('Failed to submit vote to Avail');
      } else if (selectionMode === 'backend') {
        const response = await sendVoteViaBackend(
          zkProofData,
          electionData.mina_contract_id,
          selectedDA
        );

        if (response.success) { // TODO: bu zaten arkaplanda yapılıyor
          goToNextStep();
        } else {
          console.error(123,response);
          throw new Error(response);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error submitting vote:', error);
      showToast('Failed to submit vote. Please try again', 'error');
      setLoading(false);
    }
  };

  const Placeholder = ({ className }: { className: string }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className='text-gray-500 text-6xl' />
    </div>
  );

  return (
    <div className='flex flex-col items-center px-8 sm:px-12 md:px-24 flex-grow py-12'>
      <div className='flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px] '>
        <div className='flex flex-col md:flex-row w-full h-fit '>
          <div className='w-full md:w-1/4 flex'>
            <div className='flex w-full h-32 rounded-3xl overflow-hidden'>
              <div className='w-full relative'>
                {electionData.image_url.length ? (
                  <div className='w-full h-full relative'>
                    <Image
                      src={electionData.image_url}
                      alt='Candidate 1'
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
                Election id:{' '}
                {String(electionData.mina_contract_id).slice(0, 12) + '...'}
                <span className='ml-1 cursor-pointer w-fit'>
                  <CopyButton
                    textToCopy={electionData.mina_contract_id}
                    iconColor='#F6F6F6'
                    position={{ top: -26, left: -38 }}
                  />{' '}
                </span>
              </div>
            </div>
            <div className=' flex flex-col  w-full h-fit '>
              <h2 className='text-[24px] mb-2'>{electionData.question}</h2>
            </div>
            <div className='flex flex-col w-full'>
              <div className='text-[#B7B7B7] text-sm mb-2 flex flex-row items-center gap-2'>
                <Clock />
                {new Date(electionData.start_date).toLocaleDateString() + ' ' + new Date(electionData.start_date).getHours() + ':' + new Date(electionData.start_date).getMinutes() + ' - ' + new Date(electionData.end_date).toLocaleDateString() + ' ' + new Date(electionData.end_date).getHours() + ':' + new Date(electionData.end_date).getMinutes()}
              </div>
            </div>
            <div className='flex flex-col w-full'>
              <div className='text-[#B7B7B7] text-sm mb-2 flex flex-row items-center '>
                {electionData.voters_list.length} Voters
              </div>
            </div>
          </div>
        </div>
        <div className='pt-4 pb-2 w-full'>
          <h3 className='text-[16px] text-[#B7B7B7] mb-4'>Your Choice</h3>
          <div className='pl-4 rounded text-[20px]'>
            {electionData.options[selectedOption]}
          </div>
        </div>
      </div>
      <ModeSelection
        setSelectionMode={setSelectionMode}
        selectionMode={selectionMode}
      />
      <DASelection
        selectionMode={selectionMode}
        communicationLayers={electionData.communication_layers}
        selectedDA={selectedDA}
        setSelectedDA={setSelectedDA}
        isSubmitting={isSubmitting}
        downloadVoteProof={downloadVoteProof}
      />
      <div className='w-full pt-8 flex justify-between'>
        <Button
          onClick={goToPrevStep}
          variant='back'
          className='mr-4'
        >
          Back
        </Button>
        {selectionMode === 'direct' ? (
          selectedDA === 'Avail' ? (
            !subwalletAccount ? (
              <div className={`${!selectedDA ? 'hidden' : 'flex'}`}>
                <Button onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!selectedDA || isSubmitting}
                loading={isSubmitting}
              >
                Submit Vote
              </Button>
            )
          ) : selectedDA === 'Celestia' ? (
            <Button
              onClick={handleNext}
              disabled={!selectedDA || isSubmitting}
              loading={isSubmitting}
            >
              Continue
            </Button>
          ) : null
        ) : selectionMode === 'backend' ? (
          <Button
            onClick={handleNext}
            disabled={!selectedDA || isSubmitting}
            loading={isSubmitting}
          >
            Submit Vote
          </Button>
        ) : null}
      </div>
      {isPopupOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-[#141414] rounded-[50px] p-8 shadow-lg w-[680px] h-auto border-[1px] border-primary text-center relative'>
            <button
              onClick={() => setIsPopupOpen(false)}
              className='flex w-full justify-end'
            >
              <IoClose size={28} />
            </button>
            <div className='px-[57px] py-2'>
              <h3 className='text-xl mb-4'>
                Manual Vote Submission Required
              </h3>
              <p className='mb-8'>
                Please make sure you submitted your vote manually before continuing.
              </p>
              <div className='flex justify-center pt-9'>
                <Button
                  onClick={handlePopupConfirm}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
