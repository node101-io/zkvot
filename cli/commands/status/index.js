import command from '../../utils/command.js';

const status = () => {
  console.log();
};

command
  .command('status')
  .description('get the status of all elections')
  .action(status);
