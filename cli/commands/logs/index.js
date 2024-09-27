import command from '../../utils/command.js';

const logs = election_id => {
  console.log('logs', str);
};

command
  .command('logs')
  .description('stream logs of counting processes')
  .argument('<election-id>', 'public key of the vote')
  .action(logs);
