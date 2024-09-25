import { Command } from 'commander';

import count from './commands/count.js';
import status from './commands/status.js';
import logs from './commands/logs.js';
import serve from './commands/serve.js';

import packageJson from './package.json' assert { type: "json" };

// db structure
// election_id: {
//   ended: false,
//   counted: 400,
//   counted: 123
//   total: 400
//   unofficial_result: {
//    yes: 200,
//   }
//   result_proof: {
//   },
// }

const program = new Command();

program
  .name('zkvot')
  .description('anonymous election sequencer cli')
  .version(packageJson.version, '-v, --version', 'output the current version');

program
  .command('count')
  .description('count votes by id')
  .argument('<election-id>', 'public key of the vote')
  .action(count);

program
  .command('status')
  .description('get the status of all elections')
  .action(status);

// zkvot status
// election 38512841049242: SETTLED
// election 38512841049242: COUNTING
// election 38512841049242: READING FROM DA

program
  .command('logs')
  .description('stream logs of counting processes')
  .argument('<election-id>', 'public key of the vote')
  .action(logs);

program
  .command('serve')
  .description('serve the live results on port `10101` as counting')
  .action(serve);

// program
//   .command('result')
//   .description('get the result proof of a election by id')
//   .argument('<election-id>', 'public key of the vote')
//   .action(result);

program.parse();
