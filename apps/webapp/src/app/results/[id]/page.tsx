'use client';

import { useEffect, useState, useContext } from 'react';
import Image, { StaticImageData } from 'next/image';
import { motion } from 'framer-motion';
import { FaImage } from 'react-icons/fa';

import {
  AggregationMM as Aggregation,
  Election,
  types,
  utils,
} from 'zkvot-core';

import Button from '../../(partials)/button.jsx';
import CopyButton from '@/app/(partials)/copy-button.jsx';
import DateFormatter from '@/app/(partials)/date-formatter.jsx';
import ToolTip from '@/app/(partials)/tool-tip.jsx';

import { ToastContext } from '@/contexts/toast-context.jsx';
import { ZKProgramCompileContext } from '@/contexts/zk-program-compile-context.jsx';

import Clock from '@/public/elections/partials/clock-icon.jsx';
import LearnMoreIcon from '@/public/elections/partials/learn-more-icon.jsx';

import AvailLogo from '@/public/general/blockchain-logos/avail.png';
import CelestiaLogo from '@/public/general/blockchain-logos/celestia.png';
import MinaLogo from '@/public/general/blockchain-logos/mina.png';

import { fetchElectionResultByContractIdFromBackend } from '@/utils/backend.js';
import { calculateTimestampFromSlot, verifyAggregationProof } from '@/utils/o1js.js';
import { AuroWalletContext } from '@/contexts/auro-wallet-context.jsx';

const MINA_RPC_URL = `https://api.minascan.io/node/${!!process.env.DEVNET ? 'devnet' : 'mainnet'}/v1/graphql`;

type Result = {
  percentage: number;
  voteCount: string;
};

type ResultCardProps = {
  option: string;
  result: Result;
  index: number;
};

type EnhancedResultsProps = {
  title: string;
  logo: StaticImageData;
  description: string;
  results: Result[];
  options: string[];
  loading: boolean;
};

export default function ResultsPage({ params }: { params: { id: string } }) {
  const { showToast } = useContext(ToastContext);
  const {
    zkProgramWorkerClientInstance,
    isVoteProgramCompiled, isVoteProgramCompiling,
    isAggregationProgramCompiled, isAggregationProgramCompiling,
    compileAggregationProgramIfNotCompiled
  } = useContext(ZKProgramCompileContext);

  const [loading, setLoading] = useState<boolean>(true);
  const [electionData, setElectionData] = useState<types.ElectionBackendData | null>(null);
  const [hardFinalityResult, setHardFinalityResult] = useState<{
    percentage: number;
    voteCount: string;
  }[]>([]);
  const [softFinalityResult, setSoftFinalityResult] = useState<{
    percentage: number;
    voteCount: string;
  }[]>([]);
  const [isSoftFinalityResultVerified, setIsSoftFinalityResultVerified] = useState<boolean>(false);
  const [softFinalityProof, setSoftFinalityProof] = useState<string>('');
  const { auroWalletAddress } = useContext(AuroWalletContext);
  const [electionDates, setElectionDates] = useState<{
    start_date: Date;
    end_date: Date;
  } | null>(null);

  const verifySoftFinalityProof = async (
    softFinalityResult: number[],
    softFinalityProof: string
  ) => {
    try {
      const verificationKey = zkProgramWorkerClientInstance
        ? await zkProgramWorkerClientInstance.getAggregationProgramVerificationKey()
        : Aggregation.verificationKey;

      if (
        !verifyAggregationProof(
          softFinalityProof,
          verificationKey,
          params.id,
          electionData?.voters_merkle_root || '',
          electionData?.options.length || 0,
          softFinalityResult
        )
      ) {
        showToast('Invalid soft finality proof', 'error');
        setSoftFinalityResult([]);
        return;
      };

      setIsSoftFinalityResultVerified(true);
    } catch (error) {
      showToast('Invalid soft finality proof', 'error');
      setSoftFinalityResult([]);
    };
  };

  const fetchElectionData = () => {
    return new Promise(
      (resolve: (data: types.ElectionBackendData) => void, reject) => {
        Election.fetchElectionState(
          params.id,
          MINA_RPC_URL,
          (err, election_state) => {
            if (err || !election_state)
              return reject('Failed to fetch election state');

            const storageLayerInfo = utils.decodeStorageLayerInfo(
              election_state.storageLayerInfoEncoding
            );

            utils.fetchDataFromStorageLayer(
              storageLayerInfo,
              (err, election_static_data) => {
                if (err || !election_static_data)
                  return reject('Failed to fetch election data');

                if (
                  !utils.verifyElectionDataCommitment(
                    election_static_data,
                    election_state.storageLayerCommitment
                  )
                )
                  return reject('Election data commitment verification failed');

                const result = election_state.voteOptions.toResults();

                return resolve(
                  utils.convertElectionStaticDataToBackendData(
                    !!process.env.DEVNET,
                    params.id,
                    storageLayerInfo.id,
                    storageLayerInfo.platform,
                    election_static_data,
                    result
                  )
                );
              }
            );
          }
        );
      }
    );
  };

  const handleSettleClick = async () => {
    if (!zkProgramWorkerClientInstance) {
      showToast('Unknown error occurred, please try again', 'error');
      return;
    };

    if (isVoteProgramCompiling || !isVoteProgramCompiled) {
      showToast('zkVot is loading in the background, please wait a minute and try again', 'error');
      return;
    };

    if (!electionData) {
      showToast('Unknown error occurred, please try again', 'error');
      console.error('electionData is null');
      return;
    };

    await compileAggregationProgramIfNotCompiled();

    zkProgramWorkerClientInstance.setActiveInstance({ devnet: !!process.env.DEVNET });

    const settlementTxJson = await zkProgramWorkerClientInstance.submitElectionResult(
      electionData?.mina_contract_id,
      {
        electionStartSlot: electionData.start_slot,
        electionFinalizeSlot: electionData.end_slot,
        votersRoot: BigInt(electionData.voters_merkle_root),
      },
      softFinalityProof,
      auroWalletAddress,
      auroWalletAddress
    );

    if (!settlementTxJson) {
      showToast('Error creating settlement transaction', 'error');
      return;
    };

    try {
      const { hash } = await (window as any).mina.sendTransaction({
        transaction: settlementTxJson,
        feePayer: {
          fee: 0.1,
          memo: `zkvot.io`,
        },
      });

      console.log(`https://minascan.io/devnet/tx/${hash}`);
      showToast('Settlement transaction sent successfully', 'success');
    } catch (error) {
      showToast('Error sending settlement transaction', 'error');
    };
  };

  useEffect(() => {
    setLoading(true);

    fetchElectionData()
      .then((data: types.ElectionBackendData) => {
        setElectionData(data);

        const totalVoteCount = data.result.reduce((acc, curr) => acc + curr, 0);

        setHardFinalityResult(
          data.result.slice(0, data.options.length).map((each) => {
            const percentage = (each / totalVoteCount) * 100;
            return {
              percentage: Math.floor(percentage),
              voteCount: each.toString(),
            };
          })
        );
      })
      .catch((_) => {
        showToast('Error loading results, please try again', 'error');
      })
      .finally(() => {
        setLoading(false);
      });

    fetchElectionResultByContractIdFromBackend(params.id)
      .then((data) => {
        setSoftFinalityResult(data.result);
        // softFinalityProof = data.proof;
        setSoftFinalityProof(data.proof);

        verifySoftFinalityProof(
          data.result.map((result) => Number(result.voteCount)),
          softFinalityProof
        );
      })
      .catch((_) => {
        showToast("Error fetching election's soft finality result", 'error');
      });
  }, []);

  useEffect(() => {
    if (!electionData) return;

    calculateTimestampFromSlot(electionData.start_slot, electionData.end_slot)
      .then((dates) => setElectionDates({
        start_date: dates.start_date,
        end_date: dates.end_date
      }))
  }, [electionData]);

  const Placeholder = () => (
    <div className="animate-pulse flex flex-col w-full">
      <div className="pb-4 w-full text-start">
        <div className="bg-[#1B1B1B] h-4 w-1/6 rounded"></div>
      </div>
      <div className="flex flex-col md:flex-row items-start w-full h-full text-white mb-6 flex-grow">
        <div className="w-full md:w-1/2 flex">
          <div className="flex w-full h-64 rounded-3xl overflow-hidden">
            <div className="w-full relative bg-[#1B1B1B]"></div>
          </div>
        </div>
        <div className="p-4 w-full h-full flex flex-col justify-between">
          <div className="flex flex-row w-full justify-between">
            <div className="bg-[#1B1B1B] h-4 w-48 rounded"></div>
            <div className="bg-[#1B1B1B] h-4 w-24 rounded"></div>
          </div>
          <div className="flex-grow min-h-52">
            <div className="bg-[#1B1B1B] h-8 w-3/4 rounded mb-4"></div>
            <div className="bg-[#1B1B1B] h-4 w-full rounded mb-2"></div>
            <div className="bg-[#1B1B1B] h-4 w-5/6 rounded mb-2"></div>
            <div className="bg-[#1B1B1B] h-4 w-4/6 rounded"></div>
          </div>
        </div>
      </div>
      <div className="w-full my-5">
        <div className="bg-[#1B1B1B] h-6 w-24 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((_, index) => (
            <div
              key={index}
              className="p-4 bg-[#1B1B1B] rounded-2xl h-12"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  const ResultCard: React.FC<ResultCardProps> = ({ option, result, index }) => (
    <div className="w-full flex flex-col items-start space-y-2">
      <div className="flex items-center justify-start w-full">
        <span className="text-white text-[14px]">{option}</span>
        <span className="text-white text-[14px] pl-2">
          %{isNaN(result.percentage) ? 0 : result.percentage} (
          {Number(result.voteCount).toLocaleString()})
        </span>
      </div>
      <div className="w-full bg-[#434446] rounded-full overflow-hidden h-[30px]">
        <motion.div
          className="bg-green-500 h-full bg-primary rounded-r-full"
          initial={{ width: '0%' }}
          animate={{
            width: `${isNaN(result.percentage) ? 0 : result.percentage}%`,
          }}
          transition={{ delay: index * 0.2 + 0.4, duration: 0.3 }}
        />
      </div>
    </div>
  );

  const EnhancedResults: React.FC<EnhancedResultsProps> = ({
    title,
    logo,
    description,
    results,
    options,
    loading,
  }) => (
    <div className="flex flex-col items-center w-full h-full justify-between">
      <div className="flex flex-col space-y-[32px] items-start mt-20 w-full">
        <div className="w-full flex flex-row items-start space-x-4 max-h-[108px]">
          <div>
            <Image
              className="rounded-3xl overflow-hidden"
              src={logo}
              alt="Settlement Layer Logo"
              width={108}
              height={108}
            />
          </div>
          <div className="flex flex-col text-white">
            <p className="text-[24px] -translate-y-1">{title}</p>
            <p className="w-full md:w-[407px] text-[14px] leading-6 tracking-[-0.16px] font-light">
              {description}
            </p>
          </div>
        </div>
        <div className="w-full space-y-7 pb-2">
          {loading ? (
            <p className="text-white">Loading results...</p>
          ) : (
            results.map((result, index) => (
              <ResultCard
                key={index}
                option={options[index] || 'Option'}
                result={result}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8 flex-grow h-full justify-between bg-[#121212]">
      <div className="w-full flex flex-col items-center max-w-[1216px]">
        {loading ? (
          <Placeholder />
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start w-full text-white flex-grow bg-[#1F1F1F] p-6 rounded-[30px] shadow-xl">
              <div className="w-full md:w-1/2 flex mb-6 md:mb-0">
                <div className="flex w-full h-72 rounded-3xl overflow-hidden shadow-lg">
                  <div className="w-full relative">
                    {electionData?.image_url ? (
                      <Image
                        src={electionData.image_url}
                        alt="Election Image"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-3xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2A2A2A] rounded-3xl flex items-center justify-center">
                        <FaImage className="text-gray-600 text-5xl" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 w-full h-full flex flex-col justify-between">
                <div className="flex flex-row w-full justify-between items-center mb-4">
                  <div className="text-[#B7B7B7] text-sm flex flex-row items-center">
                    <span className="mr-2">
                      <ToolTip
                        content="Election ID is a unique identifier for this election on the Mina blockchain."
                        position="top"
                        arrowPosition="start"
                      >
                        <LearnMoreIcon color="#B7B7B7" />
                      </ToolTip>
                    </span>
                    <span className="flex items-center">
                      Election ID: {electionData?.mina_contract_id.slice(0, 12)}
                      ...
                      <CopyButton
                        textToCopy={electionData?.mina_contract_id || ''}
                        iconColor="#B7B7B7"
                        position={{ top: -4, left: -20 }}
                      />
                    </span>
                  </div>
                  <span className="flex flex-row justify-center items-center text-sm text-[#B7B7B7]">
                    <Clock />
                    <span className="ml-2">
                      <DateFormatter date={electionDates?.start_date} />
                    </span>
                  </span>
                </div>
                <div className="flex-grow">
                  <h2 className="text-3xl font-semibold text-white mb-3">
                    {electionData?.question}
                  </h2>
                  <p className="text-[#E0E0E0] italic mb-6">
                    {electionData?.description}
                  </p>
                  <div className="flex items-center">
                    <span className="text-white mr-2">Options:</span>
                    {electionData?.options.map((option, idx) => (
                      <span
                        key={idx}
                        className="text-[#F6F6F6] bg-[#333333] px-3 py-1 rounded-xl mr-2 text-sm"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
              <EnhancedResults
                title="Soft Finality Results"
                logo={
                  electionData?.communication_layers[0].name === 'Avail'
                    ? AvailLogo
                    : CelestiaLogo
                }
                description="These results are yet unofficial, but verified by a proof in your local browser. They are not final until they are settled by an aggregator or you."
                results={softFinalityResult}
                options={electionData?.options || []}
                loading={loading || !isSoftFinalityResultVerified}
              />
              <EnhancedResults
                title="Hard Finality Results"
                logo={MinaLogo}
                description="These results are final, coming from the Settlement Layer. The number of votes here may increase until the election is over, but can never decrease."
                results={hardFinalityResult}
                options={electionData?.options || []}
                loading={loading}
              />
            </div>
            <Button className="mt-10 mb-20 mr-auto" onClick={handleSettleClick}>
              Settle Results
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
