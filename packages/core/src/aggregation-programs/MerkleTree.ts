import { Field, MerkleWitness, MerkleTree, Poseidon, PublicKey } from 'o1js';

const MERKLE_DEPTH = 20;

namespace MerkleTreeNamespace {
  export class Witness extends MerkleWitness(MERKLE_DEPTH) {}

  // TODO: Optimize sorting to work on strings without convering to provable types
  function fieldArrayToBigInt(fields: Field[]): BigInt {
    return Poseidon.hash(fields).toBigInt();
  }

  export const indexOf = (leaves: string[], leaf: string): number => {
    const sortedLeaves = leaves.map(each => PublicKey.fromBase58(each).toFields()).sort((a, b) => {
      if (fieldArrayToBigInt(a) < fieldArrayToBigInt(b)) return -1;
      if (fieldArrayToBigInt(a) > fieldArrayToBigInt(b)) return 1;
      return 0;
    });

    let index = -1;

    sortedLeaves.forEach((each, i) => {
      if (fieldArrayToBigInt(each) === fieldArrayToBigInt(PublicKey.fromBase58(leaf).toFields()))
        index = i;
    });

    return index;
  }

  export const createFromFieldsArray = (
    leaves: Field[][]
  ): MerkleTree | undefined => {
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
    }
  };

  export const createFromStringArray = (
    leaves: string[]
  ): MerkleTree | undefined => {
    return createFromFieldsArray(leaves.map(leaf => PublicKey.fromBase58(leaf).toFields()));
  };
}

export default MerkleTreeNamespace;
