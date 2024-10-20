"use client";
import React, { useContext, useState } from "react";
import ProgressBar from "@/components/vote/ProgressBar";
import StepOne from "@/components/vote/StepOne";
import StepTwo from "@/components/vote/StepTwo";
import { MinaWalletContext } from "@/contexts/MinaWalletContext";
import { MetamaskWalletContext } from "@/contexts/MetamaskWalletContext";
import StepThree from "@/components/vote/StepThree";
import mockElections from "@/utils/mockElectionsData";

const VotePage = ({ params }) => {
  const { id } = params;
  const electionData = mockElections.find(
    (election) => election.electionId.toString() === id
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState({});

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedDA, setSelectedDA] = useState(null);

  const [selectedWallet, setSelectedWallet] = useState(null);

  const [zkProofData, setZkProofData] = useState(null);

  const { generateZkProofWithMina } = useContext(MinaWalletContext);
  const { generateZkProofWithMetamask } = useContext(MetamaskWalletContext);

  const submitZkProof = async () => {
    setLoading(true);
    setStepErrors({ ...stepErrors, [currentStep]: false });
    try {
      let zkProof;
      if (selectedWallet === "Mina") {
        zkProof = await generateZkProofWithMina(selectedChoice, electionData);
      } else if (selectedWallet === "Metamask") {
        zkProof = await generateZkProofWithMetamask(
          selectedChoice,
          electionData
        );
      } else {
        throw new Error("No wallet selected");
      }
      console.log("Generated ZK proof:", zkProof);
      setZkProofData(zkProof);
    } catch (error) {
      console.error("Error generating ZK proof:", error);
      setStepErrors({ ...stepErrors, [currentStep]: true });
    } finally {
      setLoading(false);
    }
  };

  const goToNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="flex w-full justify-center h-full">
      <div className="h-full max-w-[1216px] flex flex-col w-full">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={3}
          stepErrors={stepErrors}
          loading={loading}
        />

        {currentStep === 1 && (
          <StepOne
            electionData={electionData}
            selectedChoice={selectedChoice}
            setSelectedChoice={setSelectedChoice}
            goToNextStep={goToNextStep}
            loading={loading}
            errorStep={stepErrors[currentStep]}
            setLoading={setLoading}
            submitZkProof={submitZkProof}
            selectedWallet={selectedWallet}
            setSelectedWallet={setSelectedWallet}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            electionData={electionData}
            selectedChoice={selectedChoice}
            selectedDA={selectedDA}
            setSelectedDA={setSelectedDA}
            goToNextStep={goToNextStep}
            zkProofData={zkProofData}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {currentStep === 3 && (
          <StepThree
            electionData={electionData}
            selectedChoice={selectedChoice}
          />
        )}
      </div>
    </div>
  );
};

export default VotePage;
