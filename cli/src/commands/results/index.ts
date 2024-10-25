import command from '../../utils/command.js';

import deleteSubcommand from './sub/delete/index.js';
import settleSubcommand from './sub/settle/index.js';

export default () => {
  return command
    .command('results')
    .description('Shows the results of all counted elections')
    .option('-e, --election-id <election-id>', 'Shows the results of a specific election')
    .addCommand(deleteSubcommand())
    .addCommand(settleSubcommand())
    .action((options) => {
      console.log('results', options);
    });
};
