'use client';

import { PropsWithChildren, Dispatch, useEffect, createContext, useState, SetStateAction } from 'react';

import ZKProgramWorkerClient from '@/utils/ZKProgramWorkerClient.js';

interface ZKProgramCompileContextInterface {
  zkProgramWorkerClientInstance: ZKProgramWorkerClient | null;
  setZkProgramWorkerClientInstance: Dispatch<
    SetStateAction<ZKProgramCompileContextInterface['zkProgramWorkerClientInstance']>
  >;
  isVoteProgramCompiled: boolean;
  isVoteProgramCompiling: boolean;
  isAggregationProgramCompiled: boolean;
  isAggregationProgramCompiling: boolean;
  compileAggregationProgramIfNotCompiled: () => Promise<void>
};

export const ZKProgramCompileContext = createContext<ZKProgramCompileContextInterface>({
  zkProgramWorkerClientInstance: null,
  setZkProgramWorkerClientInstance: () => {},
  isVoteProgramCompiled: false,
  isVoteProgramCompiling: false,
  isAggregationProgramCompiled: false,
  isAggregationProgramCompiling: false,
  compileAggregationProgramIfNotCompiled: () => Promise.resolve()
});

export const ZKProgramCompileProvider = ({ children }: PropsWithChildren<{}>) => {
  const [zkProgramWorkerClientInstance, setZkProgramWorkerClientInstance] = useState<ZKProgramCompileContextInterface['zkProgramWorkerClientInstance']>(null);
  // const [isVoteProgramCompiled, setIsVoteProgramCompiled] = useState<ZKProgramCompileContextInterface['isVoteProgramCompiled']>(false);
  // const [isSettingUp, setIsSettingUp] = useState<ZKProgramCompileContextInterface['isSettingUp']>(false);
  const [isVoteProgramCompiled, setIsVoteProgramCompiled] = useState<ZKProgramCompileContextInterface['isVoteProgramCompiled']>(false);
  const [isVoteProgramCompiling, setIsVoteProgramCompiling] = useState<ZKProgramCompileContextInterface['isVoteProgramCompiling']>(false);
  const [isAggregationProgramCompiled, setIsAggregationProgramCompiled] = useState<ZKProgramCompileContextInterface['isAggregationProgramCompiled']>(false);
  const [isAggregationProgramCompiling, setIsAggregationProgramCompiling] = useState<ZKProgramCompileContextInterface['isAggregationProgramCompiling']>(false);

  useEffect(() => {
    if (isVoteProgramCompiled || isVoteProgramCompiling) return;

    setIsVoteProgramCompiling(true);

    const zkProgramWorkerClientInstance = new ZKProgramWorkerClient();

    setZkProgramWorkerClientInstance(zkProgramWorkerClientInstance);

    zkProgramWorkerClientInstance.loadAndCompileVoteProgram()
      .then(() => {
        setIsVoteProgramCompiled(true);
        setIsVoteProgramCompiling(false);
      })
      .catch((error: Error) => {
        console.log(error);
        setIsVoteProgramCompiling(false);
      });
  }, []);

  const compileAggregationProgramIfNotCompiled = async () => {
    if (isAggregationProgramCompiled || isAggregationProgramCompiling) return;

    if (!isVoteProgramCompiled || isVoteProgramCompiling)
      throw new Error('Vote program is not compiled yet');
    if (!zkProgramWorkerClientInstance)
      throw new Error('zkProgramWorkerClientInstance is not set');

    setIsAggregationProgramCompiling(true);

    try {
      await zkProgramWorkerClientInstance.loadAndCompileAggregationProgram();
      setIsAggregationProgramCompiling(false);
      setIsAggregationProgramCompiled(true);
    } catch (error) {
      console.log(error);
      setIsAggregationProgramCompiling(false);
      return;
    };
  };

  return (
    <ZKProgramCompileContext.Provider
      value={{
        zkProgramWorkerClientInstance, setZkProgramWorkerClientInstance,
        isVoteProgramCompiled, isVoteProgramCompiling,
        isAggregationProgramCompiled, isAggregationProgramCompiling,
        compileAggregationProgramIfNotCompiled
      }}
    >
      {children}
    </ ZKProgramCompileContext.Provider >
  );
};
