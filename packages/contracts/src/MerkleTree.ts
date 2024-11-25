import { Field, MerkleWitness, MerkleTree, Poseidon, PublicKey } from 'o1js';

const MERKLE_DEPTH = 20;

namespace MerkleTreeNamespace {
  export class Witness extends MerkleWitness(MERKLE_DEPTH) {};

  function fieldArrayToBigInt(fields: Field[]): BigInt {
    return BigInt(PublicKey.fromFields(fields).toBase58());
  };

  export const createFromFieldsArray = (leaves: Field[][]): MerkleTree | undefined => {
    const votersTree = new MerkleTree(MERKLE_DEPTH);
    try {
      
      leaves = leaves.sort((a, b) => {
        if (fieldArrayToBigInt(a) < fieldArrayToBigInt(b)) return -1;
        if (fieldArrayToBigInt(a) > fieldArrayToBigInt(b)) return 1;
        return 0;
      });
    
      for (let i = 0; i < leaves.length; i++) {
        const leaf = Poseidon.hash(PublicKey.fromFields(leaves[i]).toFields());
        votersTree.setLeaf(BigInt(i), leaf);
      }
    
      return votersTree;
    } catch (err) {
      console.log(err);
      return;
    };
  };

  export const createFromStringArray = (leaves: string[]): MerkleTree | undefined => {
    const votersTree = new MerkleTree(MERKLE_DEPTH);
    try {
      
      leaves = leaves.sort((a, b) => {
        if (BigInt(a) < BigInt(b)) return -1;
        if (BigInt(a) > BigInt(a)) return 1;
        return 0;
      });
    
      for (let i = 0; i < leaves.length; i++) {
        const leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());
        votersTree.setLeaf(BigInt(i), leaf);
      }
    
      return votersTree;
    } catch (err) {
      console.log(err);
      return;
    };
  };
}

export default MerkleTreeNamespace;