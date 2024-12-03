import { PrivateKey } from "o1js";
import { mockVotes } from "../example/createMockVotes.js";
import { runAggregate } from "../example/runAggregate.js";

const electionPrivateKey = PrivateKey.fromBase58(
  "EKEZQwz3GEXS5Bw9zyC8oi5YEzHAXfkjj4Msrj5BcdVUsHeaAZXi"
);
console.log(`Election Private Key: ${electionPrivateKey.toBase58()}`);
console.log(
  `Election Public Key: ${electionPrivateKey.toPublicKey().toBase58()}`
);

// await mockVotes(electionPrivateKey);
await runAggregate(electionPrivateKey.toPublicKey());

process.exit(0);
