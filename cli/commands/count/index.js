import aggregateSavedVotes from './functions/aggregateSavedVotes.js';
import getAndSaveElectionDataByElectionIdIfNotExist from './functions/getAndSaveElectionDataByElectionIdIfNotExist.js';
import installRequiredLightNodeByElectionIdIfNotExist from './functions/installRequiredLightNodeByElectionIdIfNotExist.js';
import saveAllVotesFromBlockHeightToCurrentViaLightNode from './functions/saveAllVotesFromBlockHeightToCurrentViaLightNode.js';

import command from '../../utils/command.js';
import logger from '../../utils/logger.js';

const count = (election_id, options) => {
  getAndSaveElectionDataByElectionIdIfNotExist({
    election_id: election_id,
    mina_rpc_url: options.minaRpc,
  }, (err, election) => {
    if (err)
      return logger.log('error', err);

    // installRequiredLightNodeByElectionIdIfNotExist(election, err => {
    //   if (err)
    //     return logger.log('error', err);

    //   saveAllVotesFromBlockHeightToCurrentViaLightNode(election, err => {
    //     if (err)
    //       return logger.log('error', err);

    //     aggregateSavedVotes(election_id, (err, result) => {
    //       if (err)
    //         return logger.log('error', err);

          return logger.log('info', 'result');
    //     });
    //   });
    // });
  });
};

command
  .command('count')
  .description('count votes by id')
  .argument('<election-id>', 'public key of the vote')
  .option('-r, --mina-rpc <url>', 'rpc url of the mina node to fetch the contract state')
  .action(count);

// zkvot status
// election 38512841049242: SETTLED
// election 38512841049242: COUNTING
// election 38512841049242: READING FROM DA
