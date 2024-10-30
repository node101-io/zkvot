import { Field, Poseidon } from 'o1js';

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
