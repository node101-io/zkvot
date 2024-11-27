import { MerkleTree, Poseidon, PublicKey } from "o1js";

const MERKLE_DEPTH = 20;

export default (votersList: any[]): bigint => {
  const merkleTree = new MerkleTree(MERKLE_DEPTH);

  const pubkeys = votersList.map((voter) => voter.pubkey);
  console.log("pubkeys", pubkeys);
  pubkeys.sort((left, right) => {
    if (left < right) return 1;
    if (left > right) return -1;
    return 0;
  });

  pubkeys.forEach((voter, i) => {
    merkleTree.setLeaf(
      BigInt(i),
      Poseidon.hash(PublicKey.fromBase58(voter).toFields())
    );
  });

  return merkleTree.getRoot().toBigInt();
};
