'use client';

import { PropsWithChildren, Dispatch, useContext, createContext, useState, SetStateAction } from 'react';
import { Signature } from 'o1js';

import { ZKProgramCompileContext } from '@/contexts/ZKProgramCompileContext.js';

interface MinaWalletContextInterface {
  minaWalletAddress: string;
  setMinaWalletAddress: Dispatch<
    SetStateAction<MinaWalletContextInterface['minaWalletAddress']>
  >;
  connectMinaWallet: () => Promise<void>;
  signElectionId: (electionId: string) => Promise<string | Error>;
  generateEncodedVoteProof: (vote: {
    electionId: string;
    signedElectionId: string;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }) => Promise<string | Error>;
  disconnectMinaWallet: () => void;
};

export const MinaWalletContext = createContext<MinaWalletContextInterface>({
  minaWalletAddress: '',
  setMinaWalletAddress: () => {},
  connectMinaWallet: async () => {},
  signElectionId: async () => '',
  generateEncodedVoteProof: async () => '',
  disconnectMinaWallet: () => {},
});

export const MinaWalletProvider = ({
  children
}: PropsWithChildren<{}>) => {
  const [minaWalletAddress, setMinaWalletAddress] = useState<MinaWalletContextInterface['minaWalletAddress']>('');

  const { zkProgramWorkerClientInstance, hasBeenSetup, isSettingUp } = useContext(ZKProgramCompileContext);

  const connectMinaWallet = async (): Promise<void> => {
    try {
      if (!(window as any).mina)
        throw new Error('Mina wallet extension not found. Please install it.');

      const accounts = await (window as any).mina.requestAccounts();

      if (accounts.length === 0)
        throw new Error('No accounts found in Mina wallet.');

      const address = accounts[0];
      setMinaWalletAddress(address);
    } catch (error) {
      throw new Error('Failed to connect to Mina wallet.');
    }
  };

  const signElectionId = async (
    electionId: string
  ): Promise<string | Error> => {
    try {
      if (!(window as any).mina)
        throw new Error('Mina wallet extension not found. Please install it.');

      const signature = await (window as any).mina.signMessage({ message: electionId });
      console.log('Raw signature from Mina wallet:', signature);

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

  const disconnectMinaWallet = () => {
    setMinaWalletAddress('');
  };

  return (
    <MinaWalletContext.Provider
      value={{
        minaWalletAddress,
        setMinaWalletAddress,
        connectMinaWallet,
        signElectionId,
        generateEncodedVoteProof,
        disconnectMinaWallet,
      }}
    >
      {children}
    </MinaWalletContext.Provider>
  );
};
