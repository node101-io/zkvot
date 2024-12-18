import fs from 'fs/promises';
import path from 'path';

import Vote from '../Vote.js';
import Aggregation from '../AggregationMM.js';

const { verificationKey: voteVerificationKey } = await Vote.Program.compile();
const { verificationKey: aggregationVerificationKey } = await Aggregation.Program.compile();

await fs.writeFile(path.join(import.meta.dirname, '../../../core/src/verification-keys/VoteVK.ts'), `export const verificationKey = '${JSON.stringify(voteVerificationKey)}';`);
await fs.writeFile(path.join(import.meta.dirname, '../../../core/src/verification-keys/AggregationVK.ts'), `export const verificationKey = '${JSON.stringify(aggregationVerificationKey)}';`);
