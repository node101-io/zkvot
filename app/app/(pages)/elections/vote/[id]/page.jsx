"use client";
import React, { useState } from "react";
import ProgressBar from "@/components/vote/ProgressBar";
import StepOne from "@/components/vote/StepOne";
import StepTwo from "@/components/vote/StepTwo";

const VotePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState({});

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedDA, setSelectedDA] = useState(null);

  const [zkProofData, setZkProofData] = useState(null);

  const electionData = {
    zkvoteBy: "Cosmos12sf123412y346781234781234asdasflj",
    assignedVoters: 800,
    votedNow: 300,
    electionId: 234123412341234,
    name: "Trump mı kazanır Harris mi?",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout...",
    date: "1 Jan 2024",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg",
    ],
    choices: ["Donald Trump", "Kamala Harris", "Third Choice", "Fourth Choice"],
    DAChoicesName: ["Avail", "Celestia"],
    DAChoicesDescription: [
      "It is a long established fact that a reader will be distracted by the readable content of a page.",
      "It is a long established fact that a reader will be distracted by the readable content of a page.",
    ],
    DAChoicesFee: [1.2593, 1.4212],
    DAChoicesCurrency: ["$AVAIL", "$CELE"],
  };

  const submitZkProof = async () => {
    setLoading(true);
    setStepErrors({ ...stepErrors, [currentStep]: false });
    try {
      const zkProof = await generateZkProof(selectedChoice);

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

  const generateZkProof = async (choice) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const zkProof = {
      proof: "dummy_proof_data",
      publicSignals: {
        electionId: electionData.electionId,
        choice: choice,
        timestamp: Date.now(),
      },
    };

    return zkProof;
  };

  return (
    <div className="flex w-full justify-center h-full">
      <div className="min-h-[90vh] max-w-[1216px] flex flex-col">
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
          />
        )}
      </div>
    </div>
  );
};

export default VotePage;
