import { Field, Poseidon } from 'o1js';
import { IAggregateProof } from './cli/schema';

export class LeafNode<N extends bigint, VP> {
  nullifier: N;
  voteProof: VP;

  constructor(nullifier: N, voteProof: VP) {
    this.nullifier = nullifier;
    this.voteProof = voteProof;
  }
}

export class InnerNode<N extends bigint, VP> {
  includedVotes: N[];
  range: [N, N];
  leftChild: InnerNode<N, VP> | LeafNode<N, VP> | null;
  rightChild: InnerNode<N, VP> | LeafNode<N, VP> | null;

  constructor(
    includedVotes: N[],
    range: [N, N],

    leftChild: InnerNode<N, VP> | LeafNode<N, VP> | null,
    rightChild: InnerNode<N, VP> | LeafNode<N, VP> | null
  ) {
    this.includedVotes = includedVotes;
    this.range = range;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }
}

export class SegmentTree<N extends bigint, AP, VP> {
  root: InnerNode<N, VP> | LeafNode<N, VP> | null;
  cachedAggregatorProofs: Map<N, AP>;

  constructor(root: InnerNode<N, VP> | LeafNode<N, VP> | null = null) {
    this.root = root;
    this.cachedAggregatorProofs = new Map<N, AP>();
  }

  loadCachedAggregatorProofs(mappings: Array<[N, AP]>) {
    this.cachedAggregatorProofs.clear();

    mappings.forEach(([includedVotesHash, proof]) => {
      this.cachedAggregatorProofs.set(includedVotesHash, proof);
    });
  }

  static build<N extends bigint, AP, VP>(
    votes: LeafNode<N, VP>[]
  ): SegmentTree<N, AP, VP> {
    if (votes.length === 0) {
      return new SegmentTree<N, AP, VP>(null);
    }

    votes.sort((a, b) =>
      a.nullifier < b.nullifier ? -1 : a.nullifier > b.nullifier ? 1 : 0
    );

    const buildTree = (
      start: number,
      end: number
    ): InnerNode<N, VP> | LeafNode<N, VP> => {
      if (start === end) {
        return votes[start];
      }

      const mid = Math.floor((start + end) / 2);
      const leftChild = buildTree(start, mid);
      const rightChild = buildTree(mid + 1, end);

      const leftRange =
        leftChild instanceof InnerNode
          ? leftChild.range
          : [votes[start].nullifier, votes[start].nullifier];
      const rightRange =
        rightChild instanceof InnerNode
          ? rightChild.range
          : [votes[end].nullifier, votes[end].nullifier];
      const range: [N, N] = [leftRange[0], rightRange[1]];

      const includedVotes: N[] = [];
      if (leftChild instanceof InnerNode)
        includedVotes.push(...leftChild.includedVotes);
      if (rightChild instanceof InnerNode)
        includedVotes.push(...rightChild.includedVotes);
      if (leftChild instanceof LeafNode)
        includedVotes.push(leftChild.nullifier);
      if (rightChild instanceof LeafNode)
        includedVotes.push(rightChild.nullifier);

      includedVotes.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

      return new InnerNode<N, VP>(includedVotes, range, leftChild, rightChild);
    };

    const root = buildTree(0, votes.length - 1);
    return new SegmentTree<N, AP, VP>(root);
  }

  insert(newLeaf: LeafNode<N, VP>): void {
    if (!this.root) {
      this.root = newLeaf;
      return;
    }

    const insertRecursive = (
      node: InnerNode<N, VP> | LeafNode<N, VP>,
      newLeaf: LeafNode<N, VP>
    ): InnerNode<N, VP> | LeafNode<N, VP> => {
      if (node instanceof LeafNode) {
        const newRange: [N, N] = [
          node.nullifier < newLeaf.nullifier
            ? node.nullifier
            : newLeaf.nullifier,
          node.nullifier > newLeaf.nullifier
            ? node.nullifier
            : newLeaf.nullifier,
        ];
        const newIncludedVotes = [node.nullifier, newLeaf.nullifier];

        if (node.nullifier < newLeaf.nullifier) {
          return new InnerNode<N, VP>(
            newIncludedVotes,
            newRange,
            node,
            newLeaf
          );
        } else {
          return new InnerNode<N, VP>(
            newIncludedVotes,
            newRange,
            newLeaf,
            node
          );
        }
      } else if (node instanceof InnerNode) {
        node.range = [
          node.range[0] < newLeaf.nullifier ? node.range[0] : newLeaf.nullifier,
          node.range[1] > newLeaf.nullifier ? node.range[1] : newLeaf.nullifier,
        ];
        node.includedVotes.push(newLeaf.nullifier);
        node.includedVotes.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        const leftMax =
          node.leftChild instanceof InnerNode
            ? node.leftChild.range[1]
            : node.leftChild
            ? node.leftChild.nullifier
            : BigInt(0);

        if (newLeaf.nullifier < leftMax) {
          if (node.leftChild instanceof LeafNode) {
            node.leftChild = insertRecursive(node.leftChild, newLeaf);
          } else if (node.leftChild instanceof InnerNode) {
            node.leftChild = insertRecursive(node.leftChild, newLeaf);
          } else {
            node.leftChild = newLeaf;
          }
        } else {
          if (node.rightChild instanceof LeafNode) {
            node.rightChild = insertRecursive(node.rightChild, newLeaf);
          } else if (node.rightChild instanceof InnerNode) {
            node.rightChild = insertRecursive(node.rightChild, newLeaf);
          } else {
            node.rightChild = newLeaf;
          }
        }

        return node;
      }

      throw new Error('Unexpected node type');
    };

    this.root = insertRecursive(this.root, newLeaf);
  }

  traverse(): Array<InnerNode<N, VP>> {
    const nodes: Array<InnerNode<N, VP>> = [];
    const queue: Array<InnerNode<N, VP> | LeafNode<N, VP>> = [];

    if (this.root) {
      queue.push(this.root);

      while (queue.length > 0) {
        const currentNode = queue.shift();
        if (currentNode && currentNode instanceof InnerNode) {
          nodes.push(currentNode);

          if (currentNode.leftChild) {
            queue.push(currentNode.leftChild);
          }
          if (currentNode.rightChild) {
            queue.push(currentNode.rightChild);
          }
        }
      }
    }

    return nodes.reverse();
  }

  static includedVotesHash<N extends bigint>(includedVotes: N[]): bigint {
    includedVotes.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const nullifierArray = includedVotes.map((v) => Field.from(v.toString()));
    return Poseidon.hash(nullifierArray).toBigInt();
  }

  getCachedAggregatorProof(includedVotesHash: N): AP | null {
    return this.cachedAggregatorProofs.get(includedVotesHash) || null;
  }
}

export function collectLeaves<N extends bigint, AP, VP>(
  node: InnerNode<N, VP> | LeafNode<N, VP> | null,
  leaves: LeafNode<N, VP>[] = []
): LeafNode<N, VP>[] {
  if (!node) return leaves;

  if (node instanceof LeafNode) {
    leaves.push(node);
  } else if (node instanceof InnerNode) {
    collectLeaves(node.leftChild, leaves);
    collectLeaves(node.rightChild, leaves);
  }

  return leaves;
}

export function printTree<N extends bigint, AP, VP>(
  node: InnerNode<N, VP> | LeafNode<N, VP> | null,
  level: number = 0
): void {
  if (!node) return;

  const indent = ' '.repeat(level * 4);

  if (node instanceof LeafNode) {
    console.log(
      `${indent}LeafNode - nullifier: ${node.nullifier.toString()}, voteProof: ${
        node.voteProof
      }`
    );
  } else if (node instanceof InnerNode) {
    console.log(
      `${indent}InnerNode - range: [${node.range[0].toString()}, ${node.range[1].toString()}], includedVotes: [${node.includedVotes
        .map((v) => v.toString())
        .join(', ')}],`
    );
    printTree(node.leftChild, level + 1);
    printTree(node.rightChild, level + 1);
  }
}

const nullifier1 = BigInt(1);
const nullifier2 = BigInt(2);
const nullifier3 = BigInt(3);
const nullifier4 = BigInt(4);
const nullifier5 = BigInt(5);
const nullifier6 = BigInt(6);
const nullifier7 = BigInt(7);
const nullifier8 = BigInt(8);
const nullifier9 = BigInt(9);
const nullifier10 = BigInt(10);
const nullifier11 = BigInt(11);
const nullifier12 = BigInt(12);
const nullifier13 = BigInt(13);
const nullifier14 = BigInt(14);
const nullifier15 = BigInt(15);
const nullifier16 = BigInt(16);
const nullifier17 = BigInt(17);
const nullifier18 = BigInt(18);
const nullifier19 = BigInt(19);
const nullifier20 = BigInt(20);

const leaf1 = new LeafNode(nullifier1, 'voteProof1');
const leaf2 = new LeafNode(nullifier2, 'voteProof2');
const leaf3 = new LeafNode(nullifier3, 'voteProof3');
const leaf4 = new LeafNode(nullifier4, 'voteProof4');
const leaf5 = new LeafNode(nullifier5, 'voteProof5');
const leaf6 = new LeafNode(nullifier6, 'voteProof6');
const leaf7 = new LeafNode(nullifier7, 'voteProof7');
const leaf8 = new LeafNode(nullifier8, 'voteProof8');
const leaf9 = new LeafNode(nullifier9, 'voteProof9');
const leaf10 = new LeafNode(nullifier10, 'voteProof10');
const leaf11 = new LeafNode(nullifier11, 'voteProof11');
const leaf12 = new LeafNode(nullifier12, 'voteProof12');
const leaf13 = new LeafNode(nullifier13, 'voteProof13');
const leaf14 = new LeafNode(nullifier14, 'voteProof14');
const leaf15 = new LeafNode(nullifier15, 'voteProof15');
const leaf16 = new LeafNode(nullifier16, 'voteProof16');
const leaf17 = new LeafNode(nullifier17, 'voteProof17');
const leaf18 = new LeafNode(nullifier18, 'voteProof18');
const leaf19 = new LeafNode(nullifier19, 'voteProof19');
const leaf20 = new LeafNode(nullifier20, 'voteProof20');

const segmentTree = SegmentTree.build([
  leaf1,
  leaf2,
  leaf3,
  leaf4,
  leaf5,
  leaf6,
  leaf7,
  leaf8,
  leaf9,
  leaf10,
  leaf11,
  leaf12,
  leaf13,
  leaf14,
  leaf15,
  leaf16,
  leaf17,
  leaf18,
  leaf19,
  leaf20,
]);

printTree(segmentTree.root);

const traverseOrder = segmentTree.traverse();

traverseOrder.forEach((node, index) => {
  console.log(`Node ${index}:`);
  console.log(
    `Range: [${node.range[0].toString()}, ${node.range[1].toString()}]`
  );
  console.log(
    `Included votes: [${node.includedVotes
      .map((v) => v.toString())
      .join(', ')}]`
  );
  console.log();
});
