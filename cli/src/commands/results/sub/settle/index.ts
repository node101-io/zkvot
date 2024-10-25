import command from '../../../../utils/command.js';

export default () => {
  return command
    .command('settle')
    .description('Settles the election results to the Mina blockchain by ID')
    .argument('<election-id>', 'Public key of the election')
    .option('-r, --mina-rpc <url>', 'RPC URL of the Mina node to settle the election results')
    .action((electionId, options) => {
      console.log('settle', electionId, options);
    });
};
