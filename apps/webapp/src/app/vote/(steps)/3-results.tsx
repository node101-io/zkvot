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
import { useRouter } from 'next/navigation';
import Button from '@/app/(partials)/button';
import SuccessIcon from '@/public/general/icons/Success.svg';

const MINA_RPC_URL = `https://api.minascan.io/node/${process.env.DEVNET ? 'devnet' : 'mainnet'}/v1/graphql`;

export default ({ electionData }: { electionData: types.ElectionBackendData; }) => {
  const { showToast } = useContext(ToastContext);
  const router = useRouter();

  const handleViewResults = () => {
    router.push(`/results/${electionData.mina_contract_id}`);

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
    <div className='flex flex-col p-4'>
      <div className='bg-[#1B1B1B] rounded-3xl shadow-2xl p-6 w-full text-center'>
        <div className='flex justify-center mb-6'>
          <Image
            src={SuccessIcon}
            alt='Success Illustration'
            width={80}
            height={80}
          />
        </div>

        <h2 className='text-xl text-white mb-4 animate-fade-in'>
          Thank You for Voting!
        </h2>

        <p className='text-gray-300 mb-2'>
          Your vote for <span className='font-semibold text-white'>{`"${electionData.question}"`}</span> has been successfully submitted.
        </p>
        <p className='text-gray-300 mb-6'>
          Election ID: <span className='font-semibold text-white'>{`${electionData.mina_contract_id.slice(0, 12)}...`}</span>
        </p>

        <Button
          onClick={handleViewResults}
          className=" text-white py-2 px-4 transition duration-300"
          aria-label="View Election Results"
        >
          View Results
        </Button>
      </div>
    </div>
  );
};
