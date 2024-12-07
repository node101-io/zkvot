import command from './utils/command.js';

import './commands/index.js';
import './commands/count/index.js';
import './commands/logs/index.js';
import './commands/results/index.js';

// resultCommand();

command.parse();

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

// command
//   .command('result')
//   .description('get the result proof of a election by id')
//   .argument('<election-id>', 'public key of the vote')
//   .action(result);

// zkvot status
// election 38512841049242: SETTLED
// election 38512841049242: COUNTING
// election 38512841049242: READING FROM DA
