import React, { useState, useEffect } from "react";
import Step1 from "@/assets/StepsProgress/Step1.svg";
import Step2 from "@/assets/StepsProgress/Step2.svg";
import Step3 from "@/assets/StepsProgress/Step3.svg";
import Current1 from "@/assets/StepsProgress/Current1.svg";
import Current2 from "@/assets/StepsProgress/Current2.svg";
import Current3 from "@/assets/StepsProgress/Current3.svg";
import StepDone from "@/assets/StepsProgress/StepDone.svg";
import Completed from "@/assets/StepsProgress/Completed.svg";
import ErrorIcon from "@/assets/StepsProgress/Error.svg";
import Image from "next/image";

const ProgressBar = ({ currentStep, totalSteps, stepErrors, loading }) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  const stepLabels = [
    ["We are converting", "your vote into a ZK proof."],
    ["You are submitting", "your proof to Avail."],
    ["Wait for decentralized", "sequencers to settle"],
  ];

  const defaultIcons = [Step1, Step2, Step3];
  const currentIcons = [Current1, Current2, Current3];

  const [prevStep, setPrevStep] = useState(currentStep);

  useEffect(() => {
    if (currentStep !== prevStep) {
      setPrevStep(currentStep);
    }
  }, [currentStep, prevStep]);

  const getStepIcon = (step) => {
    if (stepErrors && stepErrors[step]) {
      return ErrorIcon;
    }

    if (step === totalSteps && currentStep === totalSteps) {
      return Completed;
    }

    if (step < currentStep) {
      return StepDone;
    }

    if (step === currentStep) {
      return currentIcons[step - 1];
    }

    return defaultIcons[step - 1];
  };

  const getProgressBarWidth = (step) => {
    if (stepErrors && stepErrors <= step) {
      return "0%";
    }
    if (loading && step === currentStep) {
      return "50%";
    }
    if (currentStep > step) {
      return "100%";
    }
    return "0%";
  };

  return (
    <div className="flex flex-col items-center my-6 w-full bg-[#1B1B1B] rounded-2xl px-4 py-8">
      <div className="w-full flex flex-col items-center ">
        <div className="w-full flex items-center px-24">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className={`flex flex-col items-center flex-none `}>
                <Image
                  src={getStepIcon(step)}
                  alt={`Step ${step}`}
                  className={`${
                    step === currentStep ? "w-10 h-10" : "w-9 h-9"
                  } `}
                />
              </div>
              {index !== steps.length - 1 && (
                <div className="flex-1 h-1 flex items-center">
                  <div
                    className="relative w-full bg-[#4E4E4E]"
                    style={{
                      height: "1px",
                      marginLeft: "15px",
                      marginRight: "15px",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      className={`absolute bg-primary ${
                        loading ? "animate-loading" : ""
                      }`}
                      style={{
                        width: getProgressBarWidth(step),
                        height: "100%",
                        left: 0,
                        top: 0,
                        transition: loading
                          ? "width 2s ease-in-out"
                          : "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 w-full flex justify-between px-6">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={`flex flex-row text-center px-2 justify-center ${
                index === 1 ? "-translate-x-4" : ""
              }
              ${index === 2 ? "-translate-x-1" : ""}`}
              style={index === 1 ? { justifyContent: "flex-start" } : {}}
            >
              <p className="text-gray-300 text-sm w-full">
                {label[0]}
                <br />
                {label[1]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
