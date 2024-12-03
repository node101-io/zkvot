"use client";

import { useContext, useState, useEffect } from "react";
import { types } from "zkvot-core";

import VotingStep from "@/app/vote/(steps)/1-VotingStep";
import SubmissionStep from "@/app/vote/(steps)/2-SubmissionStep";
import ResultPage from "@/app/vote/(steps)/3-ResultPage";

import ProgressBar from "@/app/vote/(partials)/ProgressBar";

import { ToastContext } from "@/contexts/ToastContext";

import { fetchElectionByContractIdFromBackend } from "@/utils/backend";

// TODO: remov

const Page = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const { showToast } = useContext(ToastContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [selectedDA, setSelectedDA] = useState<types.DaLayerInfo["name"] | "">(
    ""
  );
  const [zkProofData, setZkProofData] = useState<string>("");

  let electionData: types.ElectionBackendData = {
    mina_contract_id: "",
    storage_layer_id: "",
    storage_layer_platform: "A",
    start_date: new Date(),
    end_date: new Date(),
    question: "",
    options: [],
    description: "",
    image_url: "",
    voters_list: [],
    voters_merkle_root: 0n,
    communication_layers: [],
  };

  const fetchElectionData = async () => {
    const electionData: types.ElectionBackendData =
      await fetchElectionByContractIdFromBackend(params.id);
    return electionData;
  };

  const goToNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  useEffect(() => {
    fetchElectionData()
      .then((data) => {
        electionData = data;
      })
      .catch((error) => {
        showToast(
          "Failed to fetch election data, please try again later.",
          "error"
        );
      });
  }, []);

  return (
    <div className="flex w-full justify-center h-full">
      <div className="h-full max-w-[1216px] flex flex-col w-full">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={3}
          stepErrors={stepErrors}
          loading={loading}
        />
        <div className="w-full h-full pb-12">
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
