"use client";

import React, { useState, useEffect } from "react";
import ProgressBar from "../vote/ProgressBar";
import StepOne from "../vote/StepOne";
import StepTwo from "../vote/StepTwo";
import StepThree from "../vote/StepThree";

const ElectionState = ({ electionData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedDA, setSelectedDA] = useState(null);
  const [zkProofData, setZkProofData] = useState(null);

  const goToNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  useEffect(() => {
    console.log("ElectionState Updated:", {
      currentStep,
      loading,
      stepErrors,
    });
  }, [currentStep, loading, stepErrors]);

  return (
    <>
      <ProgressBar
        currentStep={currentStep}
        totalSteps={3}
        stepErrors={stepErrors}
        loading={loading}
      />

      {currentStep === 1 && (
        <StepOne
          electionData={electionData}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          goToNextStep={goToNextStep}
          loading={loading}
          errorStep={stepErrors[currentStep]}
          setLoading={setLoading}
          setZkProofData={setZkProofData}
        />
      )}
      {currentStep === 2 && (
        <StepTwo
          electionData={electionData}
          selectedOption={selectedOption}
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
          selectedOption={selectedOption}
        />
      )}
    </>
  );
};

export default ElectionState;
