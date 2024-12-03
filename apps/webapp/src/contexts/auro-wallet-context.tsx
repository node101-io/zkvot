'use client';

import { PropsWithChildren, useContext, createContext, useState } from 'react';
import { Signature } from 'o1js';

import { ZKProgramCompileContext } from '@/contexts/zk-program-compile-context.jsx';

interface AuroWalletContextInterface {
  auroWalletAddress: string;
  connectAuroWallet: () => Promise<boolean>;
  signElectionId: (electionId: string) => Promise<string | Error>;
  generateEncodedVoteProof: (vote: {
    electionId: string;
    signedElectionId: string;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }) => Promise<string | Error>;
  disconnectAuroWallet: () => void;
};

export const AuroWalletContext = createContext<AuroWalletContextInterface>({
  auroWalletAddress: '',
  connectAuroWallet: async () => false,
  signElectionId: async () => '',
  generateEncodedVoteProof: async () => '',
  disconnectAuroWallet: () => {},
});

export const AuroWalletProvider = ({
  children
}: PropsWithChildren<{}>) => {
  const [auroWalletAddress, setAuroWalletAddress] = useState<AuroWalletContextInterface['auroWalletAddress']>('');

  const { zkProgramWorkerClientInstance, hasBeenSetup, isSettingUp } = useContext(ZKProgramCompileContext);

  const connectAuroWallet = async (): Promise<boolean> => {
    try {
      if (!(window as any).auro)
        throw new Error('Auro wallet extension not found. Please install it.');

      const accounts = await (window as any).auro.requestAccounts();

      if (accounts.length === 0)
        throw new Error('No accounts found in Auro wallet.');

      const address = accounts[0];
      setAuroWalletAddress(address);
      return true;
    } catch (error) {
      throw new Error('Failed to connect to Auro wallet.');
    }
  };

  const signElectionId = async (
    electionId: string
  ): Promise<string | Error> => {
    try {
      if (!(window as any).auro)
        throw new Error('Auro wallet extension not found. Please install it.');

      const signature = await (window as any).auro.signMessage({ message: electionId });
      console.log('Raw signature from Auro wallet:', signature);

      if (!signature)
        throw new Error('Failed to sign the election ID.');

      if (
        !signature.signature ||
        typeof signature.signature.field != 'string' ||
        typeof signature.signature.scalar != 'string'
      )
        throw new Error('Unexpected signature format.');

      return Signature.fromObject({
        r: signature.signature.field,
        s: signature.signature.scalar,
      }).toBase58();
    } catch (error) {
      throw new Error('Failed to sign the election ID.');
    }
  };

  const generateEncodedVoteProof = async (vote: {
    electionId: string;
    signedElectionId: string;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }): Promise<string | Error> => {
    // const workingElectionJson = {
    //   electionId: 'B62qinHTtL5wUL5ccnKudxDWhZYAyWDj2HcvVY1YVLhNXwqN9cceFkz',
    //   signedElectionId: {
    //     r: '16346194317455302813137534197593798058813563456069267503760707907206335264689',
    //     s: '1729086860553450026742784005774108720876791402296158317085038218355413912991',
    //   },
    //   vote: 1,
    //   votersArray: [
    //     'B62qmFHof1QzKNcF1aVyasHxeMiENiUsqCM2cQTZSJ9QM6yYfyY7X8Q',
    //     'B62qrnHyqPgN8KJ1ZN4s84YGpijLqxp4wDRH6gUgb8mLJZMpN3QeJkZ',
    //     'B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon',
    //   ],
    //   publicKey: 'B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon',
    // };

    try {
      if (isSettingUp)
        throw new Error('System is initializing. Please wait...');

      if (!hasBeenSetup)
        throw new Error('System not ready yet. Please try again later.');

      if (!zkProgramWorkerClientInstance)
        throw new Error('Zkapp Worker Client not found.');

      const encodedVoteProof = await zkProgramWorkerClientInstance.createVote(vote);

      return encodedVoteProof;
    } catch (error) {
      throw new Error('Failed to generate zk-proof.');
    }
  };

  const disconnectAuroWallet = () => {
    setAuroWalletAddress('');
  };

  return (
    <AuroWalletContext.Provider
      value={{
        auroWalletAddress,
        connectAuroWallet,
        signElectionId,
        generateEncodedVoteProof,
        disconnectAuroWallet,
      }}
    >
      {children}
    </AuroWalletContext.Provider>
  );
};
