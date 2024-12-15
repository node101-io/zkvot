import { Fragment, useState, useEffect } from 'react';

import Step1 from '@/public/elections/vote-progress-bar/step-1.jsx';
import Step2 from '@/public/elections/vote-progress-bar/step-2.jsx';
import Step3 from '@/public/elections/vote-progress-bar/step-3.jsx';
import Current1 from '@/public/elections/vote-progress-bar/current-1.jsx';
import Current2 from '@/public/elections/vote-progress-bar/current-2.jsx';
import Current3 from '@/public/elections/vote-progress-bar/current-3.jsx';
import StepDone from '@/public/elections/vote-progress-bar/step-done.jsx';
import Completed from '@/public/elections/vote-progress-bar/completed.jsx';
import ErrorIcon from '@/public/elections/vote-progress-bar/error.jsx';

export default ({ currentStep, totalSteps, loading }: {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
}) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  const stepLabels = [
    ['We are converting', 'your vote into a ZK proof.'],
    ['You are submitting', 'your proof.'],
    ['Wait for decentralized', 'aggregators to settle'],
  ];

  const defaultIcons = [Step1, Step2, Step3];
  const currentIcons = [Current1, Current2, Current3];

  const [prevStep, setPrevStep] = useState(currentStep);

  useEffect(() => {
    if (currentStep !== prevStep) {
      setPrevStep(currentStep);
    }
  }, [currentStep, prevStep]);

  const getStepIcon = (step: number) => {
    if (step === totalSteps && currentStep === totalSteps)
      return <Completed />;

    if (step < currentStep)
      return <StepDone />;

    if (step === currentStep)
      switch (step) {
        case 1:
          return <Current1 />;
        case 2:
          return <Current2 />;
        case 3:
          return <Current3 />;
        default:
          return <ErrorIcon />;
      };

    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return <ErrorIcon />;
    };
  };

  const getProgressBarWidth = (step: number) => {
    if (loading && step === currentStep) {
      return '50%';
    }
    if (currentStep > step) {
      return '100%';
    }
    return '0%';
  };

  return (
    <div className='flex flex-col items-center my-6 w-full bg-[#1B1B1B] rounded-2xl px-4 py-8'>
      <div className='w-full flex flex-col items-center '>
        <div className='w-full flex items-center px-24'>
          {steps.map((step, index) => (
            <Fragment key={step}>
              <div className={`flex flex-col items-center flex-none `}>
                {getStepIcon(step)}
              </div>
              {index !== steps.length - 1 && (
                <div className='flex-1 h-1 flex items-center'>
                  <div
                    className='relative w-full bg-[#4E4E4E]'
                    style={{
                      height: '1px',
                      marginLeft: '15px',
                      marginRight: '15px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      className={`absolute bg-primary ${
                        loading ? 'animate-loading' : ''
                      }`}
                      style={{
                        width: getProgressBarWidth(step),
                        height: '100%',
                        left: 0,
                        top: 0,
                        transition: loading
                          ? 'width 2s ease-in-out'
                          : 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <div className='mt-4 w-full flex justify-between px-6'>
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={`flex flex-row text-center px-2 justify-center ${
                index === 1 ? '-translate-x-4' : ''
              }
              ${index === 2 ? '-translate-x-1' : ''}`}
              style={index === 1 ? { justifyContent: 'flex-start' } : {}}
            >
              <p className='text-gray-300 text-sm w-full'>
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
