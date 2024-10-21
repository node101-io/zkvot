import command from '../../../../utils/command.js';

export default () => {
  return command
    .command('delete')
    .description('Deletes the results of elections by ID')
    .argument('<election-id>', 'Public key of the election')
    .action((electionId) => {
      console.log('delete', electionId);
    });
};
