'use client';

import { PropsWithChildren, Dispatch, useEffect, createContext, useState, SetStateAction } from 'react';

import ZKProgramWorkerClient from '@/utils/ZKProgramWorkerClient.js';

interface ZKProgramCompileContextInterface {
  zkProgramWorkerClientInstance: ZKProgramWorkerClient | null;
  setZkProgramWorkerClientInstance: Dispatch<
    SetStateAction<ZKProgramCompileContextInterface['zkProgramWorkerClientInstance']>
  >;
  hasBeenSetup: boolean;
  setHasBeenSetup: Dispatch<
    SetStateAction<ZKProgramCompileContextInterface['hasBeenSetup']>
  >;
  isSettingUp: boolean;
  setIsSettingUp: Dispatch<
    SetStateAction<ZKProgramCompileContextInterface['isSettingUp']>
  >;
};

export const ZKProgramCompileContext = createContext<ZKProgramCompileContextInterface>({
  zkProgramWorkerClientInstance: null,
  setZkProgramWorkerClientInstance: () => {},
  hasBeenSetup: false,
  setHasBeenSetup: () => {},
  isSettingUp: false,
  setIsSettingUp: () => {}
});

export const ZKProgramCompileProvider = ({
  children
}: PropsWithChildren<{}>) => {
  const [zkProgramWorkerClientInstance, setZkProgramWorkerClientInstance] = useState<ZKProgramCompileContextInterface['zkProgramWorkerClientInstance']>(null);
  const [hasBeenSetup, setHasBeenSetup] = useState<ZKProgramCompileContextInterface['hasBeenSetup']>(false);
  const [isSettingUp, setIsSettingUp] = useState<ZKProgramCompileContextInterface['isSettingUp']>(false);

  useEffect(() => {
    const setup = async () => {
      try {
        if (!hasBeenSetup && !isSettingUp) {
          setIsSettingUp(true);

          const zkProgramWorkerClientInstance = new ZKProgramWorkerClient();

          setZkProgramWorkerClientInstance(zkProgramWorkerClientInstance);

          await new Promise((resolve) => setTimeout(resolve, 5000));

          await zkProgramWorkerClientInstance.loadAndCompileVoteProgram();

          setHasBeenSetup(true);
          setIsSettingUp(false);
        }
      } catch (error: any) {
        console.log(`Error during setup: ${error?.message}`);
      }
    };

    setup();
  }, []);

  return (
    <ZKProgramCompileContext.Provider
      value={{
        zkProgramWorkerClientInstance, setZkProgramWorkerClientInstance,
        hasBeenSetup, setHasBeenSetup,
        isSettingUp, setIsSettingUp
      }}
    >
      {children}
    </ ZKProgramCompileContext.Provider >
  );
};
