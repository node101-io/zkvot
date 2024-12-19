import { PrivateKey } from "o1js";
import { mockVotes } from "../example/createMockVotes.js";
import { runAggregate } from "../example/runAggregate.js";

const electionPrivateKey = PrivateKey.random();

console.log(`Election Private Key: ${electionPrivateKey.toBase58()}`);
console.log(
  `Election Public Key: ${electionPrivateKey.toPublicKey().toBase58()}`
);

await mockVotes(electionPrivateKey);
await runAggregate(electionPrivateKey.toPublicKey());

process.exit(0);
