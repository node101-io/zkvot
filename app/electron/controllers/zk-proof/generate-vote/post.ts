import { Request, Response } from 'express';
import {
  Field,
  MerkleTree,
  PublicKey,
  Poseidon,
  Signature,
} from 'o1js';
import { Vote, VotePrivateInputs, VotePublicInputs, MerkleWitnessClass } from 'contracts';
import { isVoteCompiled } from '../../../utils/compileZkPrograms.js';
import { encodeDataToBase64String } from '../../../utils/encodeDataToBase64String.js';

const createMerkleTreeFromLeaves = (leaves: string[]): MerkleTree => {
  let votersTree = new MerkleTree(20);

  for (let i = 0; i < leaves.length; i++) {
    const leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());

    votersTree.setLeaf(BigInt(i), leaf);
  }

  return votersTree;
};

export default (req: Request, res: Response): any => {
  if (!req.body)
    return res.status(400).json({ success: false, error: 'bad_request' });

  if (!isVoteCompiled())
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

  console.time('vote proof generation');

  Vote.vote(votePublicInputs, votePrivateInputs)
    .then(voteProof => {
      console.timeEnd('vote proof generation');

      encodeDataToBase64String(voteProof.toJSON(), (error, encodedVoteProof) => {
        if (error)
          return res.status(500).json({ success: false, error: 'internal_server_error' });

        return res.status(200).json({ success: true, data: encodedVoteProof });
      });
    })
    .catch((error) => {
      console.error(error);

      return res.status(500).json({ success: false, error: 'internal_server_error' });
    });
};

// Data to test this code:
// {
//   "electionId": "B62qinHTtL5wUL5ccnKudxDWhZYAyWDj2HcvVY1YVLhNXwqN9cceFkz",
//   "signedElectionId": {
//     "r": "16346194317455302813137534197593798058813563456069267503760707907206335264689",
//     "s": "1729086860553450026742784005774108720876791402296158317085038218355413912991"
//   },
//   "vote": 1,
//   "votersArray": [
//     "B62qmFHof1QzKNcF1aVyasHxeMiENiUsqCM2cQTZSJ9QM6yYfyY7X8Q",
//     "B62qrnHyqPgN8KJ1ZN4s84YGpijLqxp4wDRH6gUgb8mLJZMpN3QeJkZ",
//     "B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon"
//   ],
//   "publicKey": "B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon"
// }
