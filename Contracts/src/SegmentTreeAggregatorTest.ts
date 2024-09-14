import { collectLeaves, LeafNode, SegmentTree } from './SegmentTree.js';

function getRandomBigInt(min: bigint, max: bigint): bigint {
  const range = max - min + BigInt(1);
  const rand = BigInt(Math.floor(Math.random() * Number(range)));
  return min + rand;
}

function createRandomLeafNode(index: number): LeafNode<bigint, string> {
  const nullifier = getRandomBigInt(BigInt(1), BigInt(10000000000000));
  const voteProof = `voteProof${index}`;
  return new LeafNode(nullifier, voteProof);
}

function isSorted<N extends bigint, VP>(leaves: LeafNode<N, VP>[]): boolean {
  for (let i = 0; i < leaves.length - 1; i++) {
    if (leaves[i].nullifier > leaves[i + 1].nullifier) {
      return false;
    }
  }
  return true;
}

function randomTest(): void {
  const numberOfLeaves = 20000;
  const leaves: LeafNode<bigint, string>[] = [];

  for (let i = 0; i < numberOfLeaves; i++) {
    const leaf = createRandomLeafNode(i + 1);
    leaves.push(leaf);
  }

  const segmentTree = SegmentTree.build(leaves);

  // console.log('Initial Segment Tree:');
  // printTree(segmentTree.root);

  const allLeaves = collectLeaves(segmentTree.root);

  if (!isSorted(allLeaves)) {
    throw new Error('Initial leaves are not sorted');
  }

  // Insert additional random leaf nodes into the tree
  for (let i = numberOfLeaves; i < numberOfLeaves + 500; i++) {
    const newLeaf = createRandomLeafNode(i + 1);
    // console.log(
    //   `\nInserting new leaf: nullifier = ${newLeaf.nullifier.toString()}, voteProof = ${
    //     newLeaf.voteProof
    //   }`
    // );
    segmentTree.insert(newLeaf);
    // printTree(segmentTree.root);

    const allLeaves = collectLeaves(segmentTree.root);
    if (!isSorted(allLeaves)) {
      throw new Error('Initial leaves are not sorted');
    }
  }
}

for (let i = 0; i < 100; i++) {
  console.log(`Running random test ${i + 1}`);
  randomTest();
}
