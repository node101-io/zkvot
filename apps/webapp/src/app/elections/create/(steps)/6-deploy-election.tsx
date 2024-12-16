import { useContext, useState } from "react";
import Image from "next/image.js";
import { FaImage } from "react-icons/fa";
import confetti from "canvas-confetti";

import { MerkleTree, Election, types, utils } from 'zkvot-core';

import Button from "@/app/(partials)/button.jsx";
import LoadingOverlay from "@/app/(partials)/loading-overlay.jsx";

import Clock from "@/public/elections/partials/clock-icon.jsx";

import { AuroWalletContext } from "@/contexts/auro-wallet-context.jsx";
import { ToastContext } from "@/contexts/toast-context.jsx";
import { ZKProgramCompileContext } from "@/contexts/zk-program-compile-context.jsx";

import { submitElectionToBackend } from '@/utils/backend.js';
import { CommunicationLayerDetails, StorageLayerDetails } from '@/utils/constants.jsx';
import formatDate from '@/utils/formatDate.js';
import { calculateBlockHeightFromTimestamp, checkIfAccountExists } from '@/utils/o1js.js';

const DEFAULT_VOTERS_COUNT_TO_DISPLAY = 5;
const MINA_RPC_URL = `https://api.minascan.io/node/${process.env.DEVNET ? 'devnet' : 'mainnet'}/v1/graphql`;
const TX_CONFIRM_WAIT_TIME = 30 * 1000;

export default ({
  onPrevious,
  data,
}: {
  onPrevious: () => void;
  data: {
    election: types.ElectionStaticData;
    storage_layer_platform: types.StorageLayerPlatformCodes;
    storage_layer_id: string;
  };
}) => {
  const { auroWalletAddress, connectAuroWallet } =
    useContext(AuroWalletContext);
  const { showToast } = useContext(ToastContext);
  const {
    zkProgramWorkerClientInstance,
    isVoteProgramCompiled, isVoteProgramCompiling,
    isAggregationProgramCompiled, isAggregationProgramCompiling, compileAggregationProgramIfNotCompiled
  } = useContext(ZKProgramCompileContext);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAllVoters, setShowAllVoters] = useState<boolean>(false);

  const waitUntilTxIsConfirmed = async (
    minaContractId: string,
    callback: () => void
  ) => {
    Election.fetchElectionState(minaContractId, MINA_RPC_URL, (err, state) => {
      if (!err && state) return callback();

      setTimeout(
        () => waitUntilTxIsConfirmed(minaContractId, callback),
        TX_CONFIRM_WAIT_TIME
      );
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    if (loading) return;

    let address = auroWalletAddress.trim();

    try {
      address = await connectAuroWallet();
    } catch (err) {
      showToast("Please connect your wallet to continue", "error");
      return;
    }

    if (!zkProgramWorkerClientInstance) {
      showToast("Something went wrong, please try again later", "error");
      return;
    }

    if (isVoteProgramCompiling || !isVoteProgramCompiled) {
      showToast('zkVot is loading in the background, please wait a few more minutes and try again', 'error');
      return;
    }

    if (loading) return;

    setLoading(true);

    if (!(await checkIfAccountExists(address))) {
      showToast('The connected wallet appears to have no MINA funds. Please transfer some funds to your wallet or change the connect wallet from Auro Wallet', 'error');
      setLoading(false);
      return;
    }

    let minaBlockData, votersMerkleTree, result;

    try {
      minaBlockData = await calculateBlockHeightFromTimestamp(data.election.start_date, data.election.end_date);
      votersMerkleTree = MerkleTree.createFromStringArray(data.election.voters_list.map(voter => voter.public_key));
    } catch (error) {
      showToast('There was an error while creating the election data, please retry in a few minutes', 'error');
      setLoading(false);
      return;
    }

    if (!votersMerkleTree) {
      showToast('There was an error while creating the election data, please retry in a few minutes', 'error');
      setLoading(false);
      return;
    };

    if (isAggregationProgramCompiling || !isAggregationProgramCompiled) {
      showToast('zkVot is loading in the background, please wait a few more minutes and try again', 'error');
      setLoading(false);
      return;
    }

    try {
      zkProgramWorkerClientInstance.setActiveInstance({ devnet: !!process.env.DEVNET });

      result = await zkProgramWorkerClientInstance.deployElection(
        address,
        minaBlockData.startBlockHeight,
        minaBlockData.endBlockHeight,
        votersMerkleTree.getRoot().toBigInt(),
        utils.encodeStorageLayerInfo(
          data.storage_layer_platform,
          data.storage_layer_id
        ),
        utils.createElectionDataCommitment(data.election),
        undefined
      );
    } catch (error) {
      showToast('There was an error while submitting the election, please retry in a few minutes', 'error');
      setLoading(false);
      return;
    }

    if (!result) {
      showToast('Error deploying election, please try again later.', 'error');
      setLoading(false);
      return;
    };

    const { mina_contract_id, txJSON } = result;

    const { hash } = await (window as any).mina.sendTransaction({
      transaction: txJSON,
      feePayer: {
        fee: 0.1,
        memo: 'zkvot.io',
      },
    });

    console.log(`https://minascan.io/devnet/tx/${hash}`);

    waitUntilTxIsConfirmed(mina_contract_id, () => {
      setLoading(false);

      // Do not wait for backend, intentionally not awaited
      submitElectionToBackend(mina_contract_id).catch(console.error);

      // TODO: Show success message as pop up
      showToast(`Election deployed successfully! Your TX is available in https://minascan.io/devnet/tx/${hash}.`, 'success');

      confetti({
        particleCount: 100,
        spread: 180,
        origin: { y: 0.6 },
      });
    });
  };

  // TODO: Move this to a separate component
  const Placeholder = ({ className }: { className: string }) => (
    <div className={`${className} flex items-center justify-center h-full`}>
      <FaImage className="text-gray-500 text-6xl" />
    </div>
  );

  const optionalFields =
    data.election.voters_list?.length > 0
      ? Object.keys(data.election.voters_list[0]).filter(
          (key) => key !== "public_key"
        )
      : [];

  const renderCommunicationLayers = () => {
    return data.election.communication_layers.map((layer, index) => (
      <div
        key={index}
        className="flex items-center bg-[#222222] p-4 rounded-2xl mb-4"
      >
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden mr-4 flex items-center justify-center bg-gray-500">
          {CommunicationLayerDetails[layer.name].logo || (
            <div className="w-full h-full bg-gray-500 rounded-md" />
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-white text-lg mb-1 capitalize">{layer.name}</h3>
          {layer.start_block_height && (
            <span className="text-sm text-gray-400">
              Block Height: {layer.start_block_height}
            </span>
          )}
          {(layer as types.CelestiaDaLayerInfo).namespace && (
            <span className="text-sm text-gray-400">
              Namespace: {(layer as types.CelestiaDaLayerInfo).namespace}
            </span>
          )}
          {(layer as types.CelestiaDaLayerInfo).start_block_hash && (
            <span className="text-sm text-gray-400">
              Block Hash:{" "}
              {(layer as types.CelestiaDaLayerInfo).start_block_hash}
            </span>
          )}
          {(layer as types.AvailDaLayerInfo).app_id && (
            <span className="text-sm text-gray-400">
              Namespace: {(layer as types.AvailDaLayerInfo).app_id}
            </span>
          )}
        </div>
      </div>
    ));
  };

  const renderStorageLayer = () => {
    const decodedPlatform =
      utils.StorageLayerPlatformDecoding[data.storage_layer_platform];
    const layer = StorageLayerDetails[decodedPlatform];

    return (
      <div className="flex items-start bg-[#222222] p-6 rounded-2xl mb-6 space-x-4">
        <div className="w-16 h-16 flex-shrink-0 rounded-md flex items-center justify-center bg-gray-500">
          {layer.logo || (
            <div className="w-full h-full bg-gray-500 rounded-md" />
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <h3 className="text-white text-lg font-semibold capitalize">
            {decodedPlatform}
          </h3>
          <span className="text-sm text-gray-400">
            Description: {layer.description}
          </span>
          {/* Uncomment if needed
          <span className='text-sm text-gray-400'>
            Fee: {layer.fee} {layer.currency}
          </span>
          */}
        </div>
      </div>
    );
  };

  const renderOptionalFields = (voter: types.Voter) => {
    return optionalFields.map((field, index) => {
      const value = voter[field];
      if (!value) return null;

      return (
        <span
          key={index}
          className="mr-2 text-white text-sm bg-[#1E1E1E] p-3 rounded-full"
        >
          {field}: {value}
        </span>
      );
    });
  };

  const renderVotersList = () => {
    const votersToDisplay = showAllVoters
      ? data.election.voters_list
      : data.election.voters_list.slice(0, DEFAULT_VOTERS_COUNT_TO_DISPLAY);

    return (
      <>
        <div className="grid grid-cols-1 gap-4">
          {votersToDisplay.map((voter, index) => (
            <div
              key={index}
              className="flex flex-row justify-between bg-[#222222] p-4 rounded-2xl overflow-scroll"
            >
              <div className="flex items-center mb-2">
                <span className="text-white text-sm bg-[#1E1E1E] p-2 rounded-full max-w-[530px] overflow-scroll">
                  {voter.public_key}
                </span>
              </div>
              <div className="flex items-center">
                {renderOptionalFields(voter)}
              </div>
            </div>
          ))}
        </div>
        {data.election.voters_list.length > DEFAULT_VOTERS_COUNT_TO_DISPLAY && (
          <button
            onClick={() => setShowAllVoters(!showAllVoters)}
            className="mt-4 text-white transition underline"
          >
            {showAllVoters ? "Show Less" : "Show More"}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col justify-between items-center space-y-6 min-h-[calc(100vh-160px)] max-h-[calc(100vh-162px)] overflow-y-auto p-4">
      <div className="w-full">
        {loading && <LoadingOverlay text="Submitting election" />}
        <div className="mb-4">
          <h2 className="text-white text-xl"> Result</h2>
        </div>
        <div className="w-full bg-[#222222] p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 flex justify-center mb-4 md:mb-0">
              <div className="flex w-full h-32 rounded-3xl overflow-hidden">
                <div className="w-full relative">
                  {data.election.image_raw?.length ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={data.election.image_raw}
                        alt="Candidate Image"
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-l-lg"
                      />
                    </div>
                  ) : (
                    <Placeholder className="rounded-l-lg" />
                  )}
                </div>
              </div>
            </div>
            <div className="md:ml-6 flex-1">
              <div className="flex items-center mb-2 text-gray-400 text-sm space-x-1">
                <Clock />
                <div className="flex space-x-2">
                  <div>
                    <span className="font-medium ">Start Date: </span>
                    {formatDate(data.election.start_date)}
                  </div>
                  <div>
                    <span className="font-medium ">End Date: </span>
                    {formatDate(data.election.end_date)}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl mt-2">{data.election.question}</h2>
              <p className="text-sm italic text-gray-400">
                {data.election.description.length > 100
                  ? data.election.description.slice(0, 100) + "..."
                  : data.election.description}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm text-gray-400 mb-2">Options</h3>
            <div className="space-y-2">
              {data.election.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between w-full h-12 px-4 bg-[#333] rounded-full"
                >
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-sm text-gray-400 mb-4">Communication Layer</h3>
          <div className="space-y-6">{renderCommunicationLayers()}</div>
        </div>
        <div className="w-full">
          <h3 className="text-sm text-gray-400 mb-4">Storage Layer</h3>
          <div>{renderStorageLayer()}</div>
        </div>
        <div className="w-full">
          <h3 className="text-sm text-gray-400 mb-4">Voters List</h3>
          {data.election.voters_list?.length > 0 ? (
            renderVotersList()
          ) : (
            <p className="text-gray-500">No voters have participated yet.</p>
          )}
        </div>
      </div>
      <div className="w-full flex justify-between pt-4">
        <Button
          onClick={onPrevious}
          variant="back"
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          // disabled={submitted}
          className={`${submitted ? "bg-gray-500 cursor-not-allowed" : ""}`}
        >
          {submitted ? "Submitted" : "Submit"}
        </Button>
      </div>
    </div>
  );
};
