'use client';

import { useContext, useState, useEffect } from 'react';
import Image from 'next/image.js';
import { FaImage } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { Nullifier } from '@aurowallet/mina-provider';

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
// import { MetamaskWalletContext } from '@/contexts/MetamaskWalletContext';

import LearnMoreIcon from '@/public/elections/partials/learn-more-icon.jsx';
import Clock from '@/public/elections/partials/clock-icon.jsx';

export default ({
  electionData,
  selectedOption,
  setSelectedOption,
  setLoading,
  loading,
  setZkProofData,
  goToNextStep,
}: {
  electionData: types.ElectionBackendData;
  selectedOption: number;
  setSelectedOption: (option: number) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
  setZkProofData: (proof: string) => void;
  goToNextStep: () => void;
}) => {
  const { showToast } = useContext(ToastContext);

  const { hasBeenSetup } = useContext(ZKProgramCompileContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [eligibilityStatus, setEligibilityStatus] = useState('not_connected');

  const {
    auroWalletAddress,
    connectAuroWallet,
    generateEncodedVoteProof,
    disconnectAuroWallet,
    createNullifier,
  } = useContext(AuroWalletContext);

  // const {
  //   metamaskWalletAddress,
  //   connectMetamaskWallet,
  //   disconnectMetamaskWallet,
  // } = useContext(MetamaskWalletContext);

  const { selectedWallet, setSelectedWallet } = useContext(SelectedWalletContext);

  // const userWalletAddresses = [metamaskWalletAddress, auroWalletAddress]
  //   .filter(Boolean)
  //   .map((addr) => addr.trim().toLowerCase());
  const userWalletAddresses = [auroWalletAddress];

  useEffect(() => {
    if (
      userWalletAddresses.length > 0 &&
      electionData &&
      electionData.voters_list &&
      Array.isArray(electionData.voters_list)
    ) {
      console.log('Voters List:', electionData.voters_list);
      setEligibilityStatus('checking');

      const votersPublicKeyList = electionData.voters_list.map((voter) => voter.public_key.trim().toLowerCase());
      const eligible = userWalletAddresses.some((wallet) => votersPublicKeyList.includes(wallet));

      if (eligible) {
        setEligibilityStatus('eligible');
      } else {
        setEligibilityStatus('not_eligible');
      }
    } else {
      setEligibilityStatus('not_connected');
    }
  }, [userWalletAddresses, electionData]);

  useEffect(() => {
    return () => {
      setEligibilityStatus('not_connected');
    };
  }, []);

  const handleWalletSelection = async (wallet: string) => {
    try {
      if (selectedWallet === 'Mina') {
        disconnectAuroWallet();
      }
      // else if (selectedWallet === 'Metamask') {
      //   await disconnectMetamaskWallet();
      // }

      setSelectedWallet(wallet);
      setIsWalletModalOpen(false);

      let connectionSuccess = false;

      if (wallet === 'Mina') {
        connectionSuccess = await connectAuroWallet();
      }
      // else if (wallet === 'Metamask') {
      //   connectionSuccess = await connectMetamaskWallet();
      // }

      if (connectionSuccess) {
        showToast('Wallet connected successfully!', 'success');
      } else {
        setSelectedWallet('');
        showToast('Wallet connection was not successful.', 'error');
      }
    } catch (error) {
      console.error('Error during wallet selection:', error);
      showToast('An error occurred while selecting the wallet.', 'error');
    }
  };

  const handleVoteClick = async () => {
    if (
      selectedOption === null &&
      eligibilityStatus !== 'not_eligible' &&
      eligibilityStatus !== 'not_connected'
    ) {
      showToast('Please select an option to proceed.', 'error');
      return;
    }

    if (eligibilityStatus === 'eligible') {
      await handleConfirmAndContinue();
      return;
    }

    if (eligibilityStatus === 'not_eligible') {
      if (selectedWallet === 'Mina') {
        disconnectAuroWallet();
      }
      // else if (selectedWallet === 'Metamask') {
      //   await disconnectMetamaskWallet();
      // }
      setSelectedWallet('');
      setIsWalletModalOpen(true);
      return;
    }

    if (eligibilityStatus === 'not_connected') {
      setIsWalletModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const checkWalletConnection = () => {
    if (selectedWallet === 'Mina') {
      return !!auroWalletAddress;
    }
    // else if (selectedWallet === 'Metamask') {
    //   return !!metamaskWalletAddress;
    // }
    return false;
  };

  const generateElectionJson = (
    electionData: types.ElectionBackendData,
    nullifier: Nullifier,
    selectedOption: number,
    votersArray: string[],
    publicKey: string
  ) => {
    return {
      electionPubKey: electionData.mina_contract_id,
      nullifier,
      vote: selectedOption,
      votersArray: votersArray
        .map((address) => address?.trim().toLowerCase())
        .filter((address) => address),
      publicKey: publicKey,
    };
  };

  const handleConfirmAndContinue = async () => {
    if (!hasBeenSetup) {
      showToast('Please wait for the setup to complete.', 'error');
      return;
    }
    try {
      setLoading(true);
      setIsModalOpen(false);

      if (!checkWalletConnection()) {
        showToast('Wallet not connected.', 'error');
        setLoading(false); // Ensure loading is turned off
        return;
      }

      if (eligibilityStatus !== 'eligible') {
        showToast('You are not eligible to vote in this election.', 'error');
        setLoading(false); // Ensure loading is turned off
        return;
      }

      const nullifier = await createNullifier(electionData.mina_contract_id);
      console.log('nullifier', nullifier);

      if (!nullifier || nullifier instanceof Error) {
        showToast('Failed to generate the signed election ID.', 'error');
        setLoading(false); // Ensure loading is turned off
        return;
      };

      const votersArray = electionData.voters_list.map((voter) => voter.public_key).filter(each => each && each.trim().length)

      if (votersArray.length === 0) {
        showToast('No valid voters found.', 'error');
        setLoading(false); // Ensure loading is turned off
        return;
      }

      // const publicKey = selectedWallet === 'Mina' ? auroWalletAddress : metamaskWalletAddress;
      const publicKey = auroWalletAddress;

      const electionJson = generateElectionJson(
        electionData,
        nullifier,
        selectedOption,
        votersArray,
        publicKey
      );

      console.log('electionJson', electionJson);

      const proof = await generateEncodedVoteProof(electionJson);

      if (proof instanceof Error) {
        showToast('Failed to generate the zkProof.', 'error');
        setLoading(false); // Ensure loading is turned off
        return;
      };

      setZkProofData(proof);

      if (selectedWallet === 'Mina') {
        disconnectAuroWallet();
      }
      // else if (selectedWallet === 'Metamask') {
      //   await disconnectMetamaskWallet();
      // }

      goToNextStep();
    } catch (error) {
      console.error('Error submitting zkProof:', (error as any).message || error);
      showToast('Error submitting zkProof.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const Placeholder = ({ className }: { className: string }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className='text-gray-500 text-6xl' />
    </div>
  );

  return (
    <div className='flex flex-col items-center px-4 sm:px-6 md:px-8'>
      {loading && <LoadingOverlay text='Generating zk Proof...' />}

      <div className='py-4 w-full text-start'>
        Already voted?{' '}
        <button className='relative inline-flex items-center font-medium text-gray-300 transition duration-300 ease-out hover:text-white'>
          See Results
        </button>
      </div>

      <div className='flex flex-col md:flex-row items-start w-full h-full text-white mb-6 flex-grow'>
        <div className='w-full md:w-1/2 flex'>
          <div className='flex w-full h-64 rounded-3xl overflow-hidden'>
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
        <div className='p-4 w-full h-full flex flex-col justify-between'>
          <div className='flex flex-row w-full justify-between'>
            <div className='text-[#B7B7B7] text-sm mb-2 flex flex-row items-center'>
              <span className='mr-2 group relative'>
                <ToolTip
                  content='It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
                  position='top'
                  arrowPosition='start'
                >
                  <LearnMoreIcon color='#B7B7B7' />
                </ToolTip>
              </span>
              Election id:{' '}
              {String(electionData.mina_contract_id).slice(0, 12) + '...'}
              <div className='ml-2'>
                <CopyButton
                  textToCopy={electionData.mina_contract_id}
                  iconColor='#B7B7B7'
                  position={{ top: -20, left: -38 }}
                />
              </div>
            </div>
            <span className='flex flex-row justify-center items-center'>
              <span>
                <Clock />
              </span>
              <span className='ml-1 text-sm text-[#B7B7B7]'>
                <DateFormatter date={electionData.start_date} />
              </span>
            </span>
          </div>
          <div className='flex-grow min-h-52'>
            <h2 className='text-[24px] mb-2'>{electionData.question}</h2>
            <p className={`my-4 text-[16px] italic text-[#F6F6F6]`}>
              {electionData.description}
            </p>
          </div>

          <div className='flex flex-col md:flex-row justify-between py-2 gap-y-1'>
            {/* <span>
              <span className='text-[#B7B7B7] text-sm mr-1 flex flex-row items-center'>
                {electionData.voters_list} Assigned Voters
                <span className='mx-1'>-</span>
                <span className='text-green text-sm'>
                  {electionData.votedNow} Voted Now
                </span>
                <button
                  onClick={() => {
                    console.log('download');
                  }}
                  className='ml-2'
                >
                  <DownloadIcon />
                </button>
              </span>
            </span> */}
            <span className='flex flex-row items-center'>
              {/* <span className='text-primary mr-2 italic text-sm'>
                zkVote by
              </span>
              {electionData.zkvoteBy
                ? electionData.zkvoteBy.slice(0, 12) + '...'
                : 'Unknown'}
              <span className='ml-2 cursor-pointer w-fit relative'>
                <CopyButton
                  textToCopy={electionData.zkvoteBy}
                  iconColor='#F6F6F6'
                  position={{ top: -26, left: -38 }}
                />
              </span> */}
            </span>
          </div>
        </div>
      </div>

      <div className='w-full my-5'>
        <h3 className='text-xl mb-4'>Options</h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {electionData.options.map((option, index) => (
            <button
              key={index}
              className={`p-4 text-center bg-[#222222] rounded-2xl
        ${selectedOption === index
                  ? 'border-primary border-[1px] shadow-lg'
                  : 'hover:bg-[#333333]'
                }
        ${eligibilityStatus !== 'eligible' ? 'cursor-not-allowed' : ''}`}
              onClick={() => setSelectedOption(index)}
              disabled={loading || eligibilityStatus !== 'eligible'}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className='w-full pt-8 flex justify-end space-x-4'>
        <Button
          onClick={handleVoteClick}
          loading={loading}
        >
          {eligibilityStatus === 'eligible'
            ? 'Vote'
            : eligibilityStatus === 'not_eligible'
              ? 'Switch Wallet'
              : 'Connect wallet to check eligibility'}
        </Button>

        {isWalletModalOpen && (
          <WalletSelectionModal
            availableWallets={['Mina', 'Metamask']}
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

      {eligibilityStatus === 'not_eligible' && (
        <div className='w-full mt-2 text-center text-gray-300 text-sm'>
          You’re not eligible for this election. You might be connected to the
          wrong wallet. Please try switching wallets.
        </div>
      )}
    </div>
  );
};
