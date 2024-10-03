# ZKvot CLI

## Introduction
This CLI is designed to facilitate the aggregation of zero-knowledge proofs (ZKPs) in the ZKvot Protocol, specifically for counting votes while maintaining privacy, scalability, and decentralization. The aggregation process ensures that all votes are accurately counted, prevents double voting, and provides a verifiable final result using zero-knowledge proof (ZKP) aggregation.

## Features
- **Censorship Resistance**

  Ensures no votes are omitted by allowing anyone running a light node to participate in aggregation, maintaining decentralization and trustlessness.
- **ZKP Verification**

  Verifies ZKPs locally. Therefore, only valid votes cast by eligible voters will be included in the final results.
- **Aggregation of Votes**

  Aggregates vote proofs into a single ZKP, ensuring all valid votes are counted once.

## Installation

```
npm install --global zkvot
```
```
zkvot --help
```
