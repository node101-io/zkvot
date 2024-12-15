'use client';

import Image from 'next/image.js';
import { useContext, useEffect, useState } from 'react';
import { FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { Election, types } from 'zkvot-core';

import CopyButton from '@/app/(partials)/copy-button.jsx';
import DateFormatter from '@/app/(partials)/date-formatter.jsx';
import ToolTip from '@/app/(partials)/tool-tip.jsx';

import { ToastContext } from '@/contexts/toast-context.jsx';
import { ZKProgramCompileContext } from '@/contexts/zk-program-compile-context.jsx';

import LearnMoreIcon from '@/public/elections/partials/learn-more-icon.jsx';
import Clock from '@/public/elections/partials/clock-icon.jsx';

import MinaLogo from '@/public/general/blockchain-logos/mina.png';

import { fetchElectionResultByContractIdFromBackend } from '@/utils/backend.js';
import { verifyAggregationProof } from '@/utils/o1js.js';

const MINA_RPC_URL = `https://api.minascan.io/node/${process.env.DEVNET ? 'devnet' : 'mainnet'}/v1/graphql`;

export default ({ electionData }: { electionData: types.ElectionBackendData; }) => {
  const { showToast } = useContext(ToastContext);
  const { zkProgramWorkerClientInstance } = useContext(ZKProgramCompileContext);

  let softFinalityProof: string = '';

  const [loading, setLoading] = useState<boolean>(true);
  const [hardFinalityResult, setHardFinalityResult] = useState<{
    percentage: number,
    voteCount: string,
  }[]>([]);
  const [softFinalityResult, setSoftFinalityResult] = useState<{
    percentage: number,
    voteCount: string,
  }[]>([]);
  const [isSoftFinalityResultVerified, setIsSoftFinalityResultVerified] = useState<boolean>(false);

  const Placeholder = ({ className }: { className: string }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className='text-gray-500 text-6xl' />
    </div>
  );

  const emptyResults = Array.from({ length: electionData.options.length }, () => ({
    percentage: 0,
    voteCount: '0',
  }));

  const verifySoftFinalityProof = async (softFinalityResult: number[]) => {
    if (!zkProgramWorkerClientInstance) {
      showToast('zkProgramWorkerClientInstance is not found', 'error');
      setSoftFinalityResult(emptyResults);
      return;
    }

    try {
      const verificationKey = await zkProgramWorkerClientInstance.getVerificationKey();

      if (!(await verifyAggregationProof(
        softFinalityProof,
        verificationKey,
        electionData.mina_contract_id,
        electionData.voters_merkle_root,
        electionData.options.length,
        softFinalityResult,
      ))) {
        showToast('Invalid soft finality proof', 'error');
        setSoftFinalityResult(emptyResults);
        return;
      }

      setIsSoftFinalityResultVerified(true);
    } catch (error) {
      showToast('Invalid soft finality proof', 'error');
      setSoftFinalityResult(emptyResults);
    };
  };

  useEffect(() => {
    setLoading(true);

    Election.fetchElectionState(electionData.mina_contract_id, MINA_RPC_URL, (error, state) => {
      setLoading(false);
      if (error || !state) {
        showToast('Error fetching election\'s hard finality result', 'error');
        return;
      };

      const voteCounts = state.voteOptions.toResults();
      const totalVotes = voteCounts.reduce((acc, curr) => acc + curr, 0);
      const calculatedResults = electionData.options.map((option, index) => {
        const voteCount = voteCounts[index];
        const percentage = totalVotes > 0 ? (Number(voteCount) / Number(totalVotes)) * 100 : 0;

        return {
          percentage: Math.floor(percentage),
          voteCount: voteCount.toString(),
        };
      });

      setHardFinalityResult(calculatedResults);
    });

    fetchElectionResultByContractIdFromBackend(electionData.mina_contract_id)
      .catch(_ => {
        showToast('Error fetching election\'s soft finality result', 'error');
        return;
      })
      .then(data => {
        if (!data) {
          showToast('Error fetching election\'s soft finality result', 'error');
          return;
        }

        setSoftFinalityResult(data.result);
        softFinalityProof = data.proof;

        verifySoftFinalityProof(data.result.map(result => Number(result.voteCount)));
      });
  }, []);

  const handleFetchAndLogData = async () => {
    Election.fetchElectionState(electionData.mina_contract_id, MINA_RPC_URL, (error, state) => {
      if (error || !state) {
        showToast('Error fetching election hardFinalityResult', 'error');
        return;
      };

      const voteCounts = state.voteOptions.toResults();
      const totalVotes = voteCounts.reduce((acc, curr) => acc + curr, 0);
      const calculatedResults = electionData.options.map((option, index) => {
        const voteCount = voteCounts[index];
        const percentage = totalVotes > 0 ? (Number(voteCount) / Number(totalVotes)) * 100 : 0;

        return {
          name: option,
          percentage: Math.floor(percentage),
          voteCount: voteCount.toString(),
        };
      });

      setHardFinalityResult(calculatedResults);
    });
  };

  return (
    <div className='flex flex-col items-center px-4 sm:px-6 md:px-8 h-full'>
      <div className='pb-4 pt-8 w-full text-start'>Result</div>
      <div className='flex flex-col items-start w-full h-fit text-white mb-6 bg-[#222222] p-5 rounded-[30px] '>
        <div className='flex flex-col md:flex-row w-full h-fit '>
          <div className='w-full md:w-1/4 flex'>
            <div className='flex w-full h-32 rounded-3xl overflow-hidden'>
              <div className='w-full relative'>
                {electionData.image_url.trim().length ? (
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
                <span className='mr-2'>
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
                <span className='ml-1 cursor-pointer w-fit'>
                  <CopyButton
                    textToCopy={electionData.mina_contract_id}
                    iconColor='#F6F6F6'
                    position={{ top: -26, left: -38 }}
                  />
                </span>
              </div>
              <span className='flex flex-row justify-center items-center '>
                <span>
                  <Clock />
                </span>
                <span className='ml-1 text-sm text-[#B7B7B7]'>
                  <DateFormatter date={electionData.start_date} />
                </span>
              </span>
            </div>
            <div className=' flex flex-col  w-full h-fit '>
              <h2 className='text-[24px] mb-2'>{electionData.question}</h2>

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
                {/* <span className='flex flex-row items-center'>
                  <span className='text-primary mr-2 italic text-sm'>
                    zkVote by
                  </span>
                  {electionData.zkvoteBy
                    ? electionData.zkvoteBy.slice(0, 12) + '...'
                    : 'Unknown'}
                  <span className='ml-2 cursor-pointer w-fit'>
                    <CopyButton
                      textToCopy={electionData.zkvoteBy}
                      iconColor='#F6F6F6'
                      position={{ top: -26, left: -38 }}
                    />
                  </span>
                </span> */}
              </div>
            </div>
          </div>
        </div>

        <div className='w-full flex justify-end mt-4'>
          <button
            onClick={handleFetchAndLogData}
            className='px-4 py-2 bg-[#121212] text-white rounded-lg transition duration-300'
          >
            Re Fetch Data
          </button>
        </div>
      </div>

      <div className='w-full items-start pl-8 flex text-[16px] flex-col text-[#BABABA]'>
        <p className='italic'>Do you think the settlement is going too slow?</p>
        <p className='underline cursor-pointer'>Become a sequencer</p>
      </div>
      <div className='flex w-full items-start gap-20'>
        <div className='flex flex-col max-w-[945px] space-y-[32px] items-start mt-20 h-full'>
          <div className='w-full flex flex-row items-start space-x-4 max-h-[108px]'>
            <div>
              <Image
                src={MinaLogo}
                alt='Settlement Layer Logo'
                width={108}
                height={108}
              />
            </div>
            <div className='flex flex-col text-white'>
              <p className='text-[32px] -translate-y-1'>Settled hardFinalityResult</p>
              <p className='w-[407px] text-[16px] leading-6 tracking-[-0.16px] font-light'>
                The final hardFinalityResult come from Mina, the settlement layer. There
                might be a small difference between the settled...
              </p>
            </div>
          </div>
          <div className='w-full h-full pb-44 space-y-7'>
            {loading && <p>Loading hardFinalityResult...</p>}
            {!loading &&
              hardFinalityResult.map((result, index) => (
                <div
                  key={index}
                  className='w-full flex flex-col items-start space-y-2'
                >
                  <div className='flex items-center justify-start w-full'>
                    <span className='text-white text-[14px]'>
                      {electionData.options[index]}
                    </span>
                    <span className='text-white text-[14px] pl-2'>
                      %{result.percentage} (
                      {Number(result.voteCount).toLocaleString()})
                    </span>
                  </div>

                  <div className='w-full bg-[#434446] rounded-full overflow-hidden h-[30px]'>
                    <motion.div
                      className='bg-green h-full rounded-r-full'
                      initial={{ width: '0%' }}
                      animate={{ width: `${result.percentage}%` }}
                      transition={{ delay: index * 0.2 + 0.4, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className='flex flex-col max-w-[945px] space-y-[32px] items-start mt-20 h-full'>
          <div className='w-full flex flex-row items-start space-x-4 max-h-[108px]'>
            <div>
              <Image
                src={MinaLogo}
                alt='Settlement Layer Logo'
                width={108}
                height={108}
              />
            </div>
            <div className='flex flex-col text-white'>
              <p className='text-[32px] -translate-y-1'>Settled hardFinalityResult</p>
              <p className='w-[407px] text-[16px] leading-6 tracking-[-0.16px] font-light'>
                The final hardFinalityResult come from Mina, the settlement layer. There
                might be a small difference between the settled...
              </p>
            </div>
          </div>
          <div className='w-full h-full pb-44 space-y-7'>
            {loading && <p>Loading hardFinalityResult...</p>}
            {!loading &&
              softFinalityResult.map((result, index) => (
                <div
                  key={index}
                  className='w-full flex flex-col items-start space-y-2'
                >
                  <div className='flex items-center justify-start w-full'>
                    <span className='text-white text-[14px]'>
                      {electionData.options[index]}
                    </span>
                    <span className='text-white text-[14px] pl-2'>
                      %{result.percentage} (
                      {Number(result.voteCount).toLocaleString()})
                    </span>
                  </div>

                  <div className='w-full bg-[#434446] rounded-full overflow-hidden h-[30px]'>
                    <motion.div
                      className='bg-green h-full rounded-r-full'
                      initial={{ width: '0%' }}
                      animate={{ width: `${result.percentage}%` }}
                      transition={{ delay: index * 0.2 + 0.4, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
