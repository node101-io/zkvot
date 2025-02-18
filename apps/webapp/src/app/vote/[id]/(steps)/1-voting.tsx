'use client';

import { useContext, useState, useEffect } from 'react';
import Image from 'next/image.js';
import { IoClose } from 'react-icons/io5';
import { Nullifier } from '@aurowallet/mina-provider';
import { Group, PublicKey } from 'o1js';

import { types } from 'zkvot-core';

import Button from '@/app/(partials)/button.jsx';
import CopyButton from '@/app/(partials)/copy-button.jsx';
import DateFormatter from '@/app/(partials)/date-formatter.jsx';
import LoadingOverlay from '@/app/(partials)/loading-overlay.jsx';
import ToolTip from '@/app/(partials)/tool-tip.jsx';
import WalletSelectionModal from '@/app/(partials)/wallet-selection-modal.jsx';

import { AuroWalletContext } from '@/contexts/auro-wallet-context.jsx';
import { SelectedWalletContext } from '@/contexts/selected-wallet-context.jsx';
import { ToastContext } from '@/contexts/toast-context.jsx';
import { ZKProgramCompileContext } from '@/contexts/zk-program-compile-context.jsx';

import LearnMoreIcon from '@/public/elections/partials/learn-more-icon.jsx';
import Clock from '@/public/elections/partials/clock-icon.jsx';

import { calculateTimestampFromSlot } from '@/utils/o1js.js';

export default ({
  electionData,
  selectedOption,
  loading,
  daLayerSubmissionData,
  nullifier,
  setNullifier,
  setSelectedOption,
  setLoading,
  setDaLayerSubmissionData,
  goToNextStep,
  goToResults,
}: {
  electionData: types.ElectionBackendData;
  selectedOption: number;
  loading: boolean;
  daLayerSubmissionData: types.DaLayerSubmissionData;
  nullifier: Nullifier | null;
  setNullifier: (nullifier: Nullifier | null) => void;
  setSelectedOption: (option: number) => void;
  setLoading: (loading: boolean) => void;
  setDaLayerSubmissionData: (daLayerSubmissionData: types.DaLayerSubmissionData) => void;
  goToNextStep: () => void;
  goToResults: () => void;
}) => {
  const { auroWalletAddress, connectAuroWallet, createNullifier, disconnectAuroWallet, generateEncodedVoteProof } = useContext(AuroWalletContext);
  const { setSelectedWallet } = useContext(SelectedWalletContext);
  const { showToast } = useContext(ToastContext);
  const { isVoteProgramCompiled } = useContext(ZKProgramCompileContext);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [eligibilityStatus, setEligibilityStatus] = useState<'not_connected' | 'not_eligible' | 'eligible'>('not_connected');
  const [electionDates, setElectionDates] = useState<{
    start_date: Date;
    end_date: Date;
  } | null>(null);

  useEffect(() => {
    if (!electionData) return;

    calculateTimestampFromSlot(electionData.start_slot, electionData.end_slot)
      .then((dates) => setElectionDates({
        start_date: dates.start_date,
        end_date: dates.end_date
      }))
  }, [electionData]);

  // useEffect(() => {
  //   (window as any).mina?.on('accountsChanged', () => {
  //     disconnectAuroWallet();
  //     setSelectedWallet(null);
  //   });
  // }, [])

  useEffect(() => {
    if (electionData && electionData.question && electionData.options) {
      setIsDataLoading(false);
    } else {
      setIsDataLoading(true);
    }
  }, [electionData]);

  useEffect(() => {
    if (!auroWalletAddress) {
      setEligibilityStatus('not_connected');
      return;
    }

    const votersPublicKeyList = electionData.voters_list.map((voter) => voter.public_key);
    const eligible = votersPublicKeyList.includes(auroWalletAddress.trim());

    if (!eligible) {
      setEligibilityStatus('not_eligible');
      return;
    }

    setEligibilityStatus('eligible');
  }, [auroWalletAddress, electionData]);

  const handleWalletSelection = async (wallet: string) => {
    if (wallet !== 'Auro') { // Impossible
      showToast('Unsupported wallet is chosen', 'error');
      return;
    }

    setSelectedWallet('Auro');
    setIsWalletModalOpen(false);

    try {
      await connectAuroWallet();
    } catch (error) {
      console.error('Error during wallet selection:', error);
      setSelectedWallet(null);
      showToast('Please connect your wallet to vote', 'error');
    }
  };

  const handleButtonClick = async () => {
    if (eligibilityStatus === 'not_connected') {
      setIsWalletModalOpen(true);
      return;
    }

    if (eligibilityStatus === 'not_eligible') {
      showToast('You cannot vote in this election.', 'error');
      return;
    }

    if (!isVoteProgramCompiled) {
      showToast('Please wait for the setup to complete.', 'error');
      return;
    }

    if (selectedOption === -1) {
      showToast('Please select an option to proceed.', 'error');
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmAndContinue = async () => {
    setLoading(true);
    setIsModalOpen(false);

    try {
      if (eligibilityStatus !== 'eligible') {
        showToast('You are not eligible to vote in this election', 'error');
        setLoading(false);
        return;
      }

      const createdNullifier = nullifier && PublicKey.fromGroup(new Group(nullifier.publicKey)).toBase58() === auroWalletAddress ? nullifier : await createNullifier(electionData.mina_contract_id);

      if (!createdNullifier || createdNullifier instanceof Error) {
        showToast('Failed to create the nullifier, please try again', 'error');
        setLoading(false);
        return;
      };

      setNullifier(createdNullifier);

      const votersArray = electionData.voters_list.map((voter) => voter.public_key).filter(each => each && each.trim().length)

      if (votersArray.length === 0) {
        showToast('No valid voters found', 'error');
        setLoading(false);
        return;
      }

      const publicKey = auroWalletAddress;

      const voteData = {
        electionPubKey: electionData.mina_contract_id,
        nullifier: createdNullifier,
        vote: selectedOption,
        votersArray,
        publicKey: publicKey,
      };

      const proof = await generateEncodedVoteProof(voteData);

      if (proof instanceof Error) {
        showToast('Failed to generate the ZK Proof, please try again later', 'error');
        setLoading(false);
        return;
      };

      setDaLayerSubmissionData({
        election_id: daLayerSubmissionData.election_id,
        nullifier: JSON.stringify({
          x: createdNullifier.public.nullifier.x.toString(),
          y: createdNullifier.public.nullifier.y.toString(),
        }),
        proof
      });
      setLoading(false);
      goToNextStep();
    } catch (error) {
      console.error(error);
      setLoading(false);
      showToast('Error creating the vote, please try again later', 'error');
    }
  };

  const Placeholder = () => (
    <div className="animate-pulse flex flex-col w-full">
      <div className='pb-4 w-full text-start'>
        <div className='bg-[#1B1B1B] h-4 w-1/6 rounded'></div>
      </div>
      <div className='flex flex-col md:flex-row items-start w-full h-full text-white mb-6 flex-grow'>
        <div className='w-full md:w-1/2 flex'>
          <div className='flex w-full h-64 rounded-3xl overflow-hidden'>
            <div className='w-full relative bg-[#1B1B1B]'></div>
          </div>
        </div>
        <div className='p-4 w-full h-full flex flex-col justify-between'>
          <div className='flex flex-row w-full justify-between'>
            <div className='bg-[#1B1B1B] h-4 w-48 rounded'></div>
            <div className='bg-[#1B1B1B] h-4 w-24 rounded'></div>
          </div>
          <div className='flex-grow min-h-52'>
            <div className='bg-[#1B1B1B] h-8 w-3/4 rounded mb-4'></div>
            <div className='bg-[#1B1B1B] h-4 w-full rounded mb-2'></div>
            <div className='bg-[#1B1B1B] h-4 w-5/6 rounded mb-2'></div>
            <div className='bg-[#1B1B1B] h-4 w-4/6 rounded'></div>
          </div>
        </div>
      </div>
      <div className='w-full my-5'>
        <div className='bg-[#1B1B1B] h-6 w-24 rounded mb-4'></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {[1, 2, 3, 4].map((_, index) => (
            <div
              key={index}
              className='p-4 bg-[#1B1B1B] rounded-2xl h-12'
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className='flex flex-col items-center px-4 sm:px-6 md:px-8 flex-grow  h-full justify-between'>
      {loading && <LoadingOverlay text={nullifier ? 'Generating your vote...' : 'Please approve to proceed...'} />}
      <div className='w-full flex flex-col items-center'>
        {isDataLoading ? (
          <Placeholder />
        ) : (
          <>
            <div className='pb-4 w-full text-start'>
              Already voted?{' '}
              <button
                className='relative inline-flex items-center font-medium text-gray-300 transition duration-300 ease-out hover:text-white'
                onClick={goToResults}
              >
                See Results
              </button>
            </div>
            <div className='flex flex-col md:flex-row items-start w-full h-full text-white mb-6 flex-grow'>
              <div className='w-full md:w-1/2 flex'>
                <div className='flex w-full h-64 rounded-3xl overflow-hidden'>
                  <div className='w-full relative'>
                    {electionData.image_url && electionData.image_url.length ? (
                      <div className='w-full h-full relative'>
                        <Image
                          src={electionData.image_url}
                          alt='Candidate Image'
                          fill
                          style={{ objectFit: 'cover' }}
                          className='rounded-l-lg'
                        />
                      </div>
                    ) : (
                      <Placeholder />
                    )}
                  </div>
                </div>
              </div>
              <div className='p-4 w-full h-full flex flex-col justify-between'>
                <div className='flex flex-row w-full justify-between'>
                  <div className='text-[#B7B7B7] text-sm mb-2 flex flex-row items-center'>
                    <span className='mr-2 group relative'>
                      <ToolTip
                        content='Election ID is a unique identifier for each election. It matches the contract public key that this election has on Mina. zkVot utilizes Mina like a DA layer to distribute any election related information. Thus, all the information you see in this page is 100% decentralized without any backend usage.'
                        position='top'
                        arrowPosition='start'
                      >
                        <LearnMoreIcon color='#B7B7B7' />
                      </ToolTip>
                    </span>
                    Election id:
                    {String(electionData.mina_contract_id).slice(0, 12) + '...'}
                    <div className='ml-2'>
                      <CopyButton
                        textToCopy={electionData.mina_contract_id}
                        iconColor='#B7B7B7'
                        position={{ top: -20, left: -38 }} />
                    </div>
                  </div>
                  <span className='flex flex-row justify-center items-center'>
                    <span>
                      <Clock />
                    </span>
                    <span className='ml-1 text-sm text-[#B7B7B7]'>
                      <DateFormatter date={electionDates?.start_date} />
                    </span>
                  </span>
                </div>
                <div className='flex-grow min-h-52'>
                  <h2 className='text-[24px] mb-2'>{electionData.question}</h2>
                  <p className={`my-4 text-[16px] italic text-[#F6F6F6]`}>
                    {electionData.description}
                  </p>
                </div>
              </div>
            </div>
            <div className='w-full my-5'>
              <h3 className='text-xl mb-4'>Options</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {electionData.options.map((option, index) => (
                  <button
                    key={index}
                    className={`p-4 text-center bg-[#222222] rounded-2xl border-[1px]
                    ${selectedOption === index ? 'border-primary shadow-lg' : 'border-transparent hover:bg-[#333333]'}
                    ${eligibilityStatus !== 'eligible' ? 'cursor-not-allowed' : ''}`}
                    onClick={() => setSelectedOption(index)}
                    disabled={loading || eligibilityStatus !== 'eligible'}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className='w-full pt-8 flex justify-end space-x-4'>
        <Button
          onClick={handleButtonClick}
          loading={loading}
          disabled={eligibilityStatus === 'not_eligible'}
          className={eligibilityStatus === 'not_eligible' ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {eligibilityStatus === 'eligible'
            ? 'Vote'
            : eligibilityStatus === 'not_eligible'
            ? 'You are not eligible to vote'
            : 'Connect wallet to check eligibility'}
        </Button>
        {isWalletModalOpen && (
          <WalletSelectionModal
            availableWallets={['Auro']}
            onClose={() => setIsWalletModalOpen(false)}
            onSelectWallet={handleWalletSelection}
          />
        )}
        {isModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-[#141414] rounded-[50px] p-8 shadow-lg w-[680px] h-auto border-[1px] border-primary text-center relative'>
              <button
                onClick={handleCloseModal}
                className='flex w-full justify-end'
              >
                <IoClose size={28} />
              </button>
              <div className='px-[57px] py-2'>
                <h3 className='text-xl mb-4'>
                  Wait a sec, have you voted before?
                </h3>
                <p className='mb-8'>
                  Since it is fully anonymous, it is not really easy to
                  understand if you have voted before or not. Nevertheless, if
                  you send your vote twice, it will not be counted for the
                  second time. There is absolutely no danger of sending a vote
                  twice, but please do not, as it just frustrates our
                  sequencers.
                </p>
                <div className='flex justify-center pt-9'>
                  <Button
                    loading={loading}
                    onClick={handleConfirmAndContinue}
                  >
                    Nope, please continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
