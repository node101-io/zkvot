// import { Request, Response } from 'express';
// import {
//   Field,
//   Mina,
//   MerkleTree,
//   PrivateKey,
//   PublicKey,
//   Poseidon,
//   Signature,
// } from 'o1js';
// import { Vote, VotePrivateInputs, VotePublicInputs, MerkleWitnessClass } from 'contracts';

// const createMerkleTreeFromLeaves = (leaves) => {
//   let votersTree = new MerkleTree(20);

//   for (let i = 0; i < leaves.length; i++) {
//     let leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());
//     votersTree.setLeaf(BigInt(i), leaf);
//   }

//   return votersTree;
// };

// const getRootOfMerkleTree = (tree) => {
//   return tree.getRoot();
// };

// const getMerkleWitness = (tree, leafIndex) => {
//   const merkleTreeWitness = tree.getWitness(BigInt(leafIndex));

//   return new MerkleWitnessClass(merkleTreeWitness);
// }

// export default async (req: Request, res: Response) => {
//   try {
//     if (!req.body)
//       return res.status(400).send({ error: 'bad_request' });

//     // It should be done in a way that it is only compiled once,
//     console.log('compiling program...' , Date.now());
//     await Vote.compile();
//     console.log('compiled at:' , Date.now());

//     const { electionId, signedElectionId, vote, votersArray, publicKey } = req.body;

//     if (!publicKey || typeof publicKey !== 'string') return res.status(400).send({ error: 'bad_request' });
//     if (!electionId || typeof electionId !== 'string') return res.status(400).send({ error: 'bad_request' });
//     if (!signedElectionId || typeof signedElectionId !== 'object') return res.status(400).send({ error: 'bad_request' });
//     if (!vote || typeof vote !== 'number') return res.status(400).send({ error: 'bad_request' });
//     if (!votersArray || !Array.isArray(votersArray)) return res.status(400).send({ error: 'bad_request' });

//     const votersTree = createMerkleTreeFromLeaves(votersArray);
//     const witness = getMerkleWitness(votersTree, votersArray.indexOf(publicKey));

//     const votePublicInputs = new VotePublicInputs({
//       electionId: PublicKey.fromJSON(electionId),
//       vote: Field.from(vote),
//       votersRoot: getRootOfMerkleTree(votersTree),
//     });

//     const votePrivateInputs = new VotePrivateInputs({
//       voterKey: PublicKey.fromJSON(publicKey),
//       signedElectionId: Signature.fromJSON(signedElectionId),
//       votersMerkleWitness: witness,
//     });

//     console.log('Going to generate Proof', Date.now());

//     const voteProof = await Vote.vote(votePublicInputs, votePrivateInputs);
//     console.log('Proof generated at:', Date.now());

//     return res.status(200).send({ voteProof: voteProof.proof });
//   } catch (error) {
//     console.log(error)

//     return res.status(500).send({ error: 'internal_server_error' });
//   }
// };

// // Data to test this code:
// // {
// //   "electionId": "B62qinHTtL5wUL5ccnKudxDWhZYAyWDj2HcvVY1YVLhNXwqN9cceFkz",
// //   "signedElectionId": {
// //     "r": "16346194317455302813137534197593798058813563456069267503760707907206335264689",
// //     "s": "1729086860553450026742784005774108720876791402296158317085038218355413912991"
// //   },
// //   "vote": 1,
// //   "votersArray": [
// //     "B62qmFHof1QzKNcF1aVyasHxeMiENiUsqCM2cQTZSJ9QM6yYfyY7X8Q",
// //     "B62qrnHyqPgN8KJ1ZN4s84YGpijLqxp4wDRH6gUgb8mLJZMpN3QeJkZ",
// //     "B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon"
// //   ],
// //   "publicKey": "B62qrMoASjs48NFsaefftxs3w7mAb3mjhMZbRVczurAwTbcQEP2BMon"
// // }
