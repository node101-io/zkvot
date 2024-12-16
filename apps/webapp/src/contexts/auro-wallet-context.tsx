'use client';

import { Poseidon, PublicKey } from 'o1js';

import { PropsWithChildren, useContext, createContext, useState, useEffect } from 'react';
import { CreateNullifierArgs, Nullifier } from '@aurowallet/mina-provider';

import { ZKProgramCompileContext } from '@/contexts/zk-program-compile-context.jsx';

interface GenerateEncodedVoteProofParams {
  electionPubKey: string;
  nullifier: Nullifier;
  vote: number;
  votersArray: string[];
  publicKey: string;
}
interface AuroWalletContextInterface {
  auroWalletAddress: string;
  isAuroWalletInstalled: boolean;
  connectAuroWallet: () => Promise<string>;
  createNullifier: (electionId: string) => Promise<Nullifier | Error | null>;
  generateEncodedVoteProof: (vote: GenerateEncodedVoteProofParams) => Promise<string | Error>;
  disconnectAuroWallet: () => void;
};

export const AuroWalletContext = createContext<AuroWalletContextInterface>({
  auroWalletAddress: '',
  isAuroWalletInstalled: false,
  connectAuroWallet: async () => '',
  createNullifier: async () => null,
  generateEncodedVoteProof: async () => '',
  disconnectAuroWallet: () => {},
});

export const AuroWalletProvider = ({ children }: PropsWithChildren<{}>) => {
  const [auroWalletAddress, setAuroWalletAddress] = useState<AuroWalletContextInterface['auroWalletAddress']>('');
  const [isAuroWalletInstalled, setIsAuroWalletInstalled] = useState<AuroWalletContextInterface['isAuroWalletInstalled']>(false);

  const { zkProgramWorkerClientInstance, isVoteProgramCompiled, isVoteProgramCompiling } = useContext(ZKProgramCompileContext);

  useEffect(() => {
    setIsAuroWalletInstalled(!!(window as any).mina);
  }, []);

  const connectAuroWallet = async (): Promise<string> => {
    try {
      if (!(window as any).mina)
        throw new Error('Auro wallet extension not found. Please install it.');

      const accounts = await (window as any).mina.requestAccounts();

      if (accounts.length === 0)
        throw new Error('No accounts found in Auro wallet.');

      const address = PublicKey.fromJSON(accounts[0]).toBase58();

      setAuroWalletAddress(address);

      return address;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const createNullifier = async (electionId: string): Promise<Nullifier | Error> => {
    try {
      const createNullifierArgs: CreateNullifierArgs = {
        message: [Poseidon.hash(PublicKey.fromBase58(electionId).toFields()).toBigInt().toString()],
      };

      const nullifier: Nullifier = await (window as any).mina.createNullifier(createNullifierArgs);

      return nullifier;
    } catch (error) {
      throw new Error('Failed to create nullifier.');
    };
  };

  // signElectionId()
  //   if (!(window as any).mina)
  //     throw new Error('Auro wallet extension not found. Please install it.');

  //   const signature = await (window as any).mina.signMessage({ message: electionId });
  //   console.log('Raw signature from Auro wallet:', signature);

  //   if (!signature)
  //     throw new Error('Failed to sign the election ID.');

  //   if (
  //     !signature.signature ||
  //     typeof signature.signature.field != 'string' ||
  //     typeof signature.signature.scalar != 'string'
  //   )
  //     throw new Error('Unexpected signature format.');

  //   return Signature.fromObject({
  //     r: signature.signature.field,
  //     s: signature.signature.scalar,
  //   }).toBase58();
  // } catch (error) {
  //   throw new Error('Failed to sign the election ID.');
  // }

  const generateEncodedVoteProof = async (vote: GenerateEncodedVoteProofParams): Promise<string | Error> => {
    try {
      if (isVoteProgramCompiling)
        throw new Error('zkVot is preparing, please wait.');

      if (!isVoteProgramCompiled)
        throw new Error('zkVot is preparing, please wait.');

      if (!zkProgramWorkerClientInstance)
        throw new Error('Zkapp Worker Client not found.');

      const encodedVoteProof = await zkProgramWorkerClientInstance.createVote({
        ...vote,
        vote: vote.vote + 1 // vote is 1-indexed in the ZKP
      });

      return encodedVoteProof;
    } catch (error) {
      console.log(error);
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
        createNullifier,
        generateEncodedVoteProof,
        disconnectAuroWallet,
        isAuroWalletInstalled
      }}
    >
      {children}
    </AuroWalletContext.Provider>
  );
};
