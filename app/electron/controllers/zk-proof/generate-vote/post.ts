import { Request, Response } from 'express';
import {
  Field,
  MerkleTree,
  PublicKey,
  Poseidon,
  Signature,
} from 'o1js';
import { Vote, VotePrivateInputs, VotePublicInputs, MerkleWitnessClass } from 'contracts';

const createMerkleTreeFromLeaves = (leaves: string[]): MerkleTree => {
  let votersTree = new MerkleTree(20);

  for (let i = 0; i < leaves.length; i++) {
    const leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());

    votersTree.setLeaf(BigInt(i), leaf);
  }

  return votersTree;
};

let isVoteCompiled = false;

Vote.compile()
  .then(() => isVoteCompiled = true)
  .catch(error => {
    console.log('Error compiling Vote contract:', error);
  });

export default (req: Request, res: Response): any => {
  if (!req.body)
    return res.status(400).json({ success: false, error: 'bad_request' });

  if (!isVoteCompiled)
    return res.status(500).json({ success: false, error: 'not_compiled_yet' });

  const { electionId, signedElectionId, vote, votersArray, publicKey } = req.body;

  if (!publicKey || typeof publicKey !== 'string')
    return res.status(400).json({ success: false, error: 'bad_request' });
  if (!electionId || typeof electionId !== 'string')
    return res.status(400).json({ success: false, error: 'bad_request' });
  if (!signedElectionId || typeof signedElectionId !== 'object')
    return res.status(400).json({ success: false, error: 'bad_request' });
  if (!vote || typeof vote !== 'number')
    return res.status(400).json({ success: false, error: 'bad_request' });
  if (!votersArray || !Array.isArray(votersArray))
    return res.status(400).json({ success: false, error: 'bad_request' });

  const votersTree = createMerkleTreeFromLeaves(votersArray);

  const witness = votersTree.getWitness(BigInt(votersArray.indexOf(publicKey)))

  const votePublicInputs = new VotePublicInputs({
    electionId: PublicKey.fromJSON(electionId),
    vote: Field.from(vote),
    votersRoot: votersTree.getRoot(),
  });

  const votePrivateInputs = new VotePrivateInputs({
    voterKey: PublicKey.fromJSON(publicKey),
    signedElectionId: Signature.fromJSON(signedElectionId),
    votersMerkleWitness: new MerkleWitnessClass(witness),
  });

  console.log('Going to generate Proof', Date.now());

  Vote.vote(votePublicInputs, votePrivateInputs)
    .then(voteProof => {
      console.log('Proof generated at:', Date.now());

      return res.status(200).json({ voteProof: voteProof.proof });
    })
    .catch((error) => {
      console.log('Error generating proof:', error);

      return res.status(500).json({ error: 'internal_server_error' });
    });
};
