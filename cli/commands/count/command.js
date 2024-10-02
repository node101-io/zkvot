import aggregateSavedVotes from './functions/aggregateSavedVotes.js';
import getAndSaveElectionDataByElectionIdIfNotExist from './functions/getAndSaveElectionDataByElectionIdIfNotExist.js';
import installRequiredLightNodeByElectionIdIfNotExist from './functions/installRequiredLightNodeByElectionIdIfNotExist.js';
import saveAllVotesFromBlockHeightToCurrentViaLightNode from './functions/saveAllVotesFromBlockHeightToCurrentViaLightNode.js';

import logger from '../../utils/logger.js';

const args = JSON.parse(process.argv[2]);

await new Promise(resolve => setTimeout(resolve, 1000));

// getAndSaveElectionDataByElectionIdIfNotExist({
//   election_id: args.election_id,
//   mina_rpc_url: args.minaRpc,
// }, (err, election) => {
//   if (err)
//     return logger.log('error', err);

const election = {
  da_layers: [
    {
      name: 'celestia',
      start_block_height: 2832930,
      start_block_hash: '2D8F3DE4C429F4BD09333C9D291A4612484E929B9D2C60B4F3E42BB27D71FED6',
      namespace: 'kksafopasoğ-=2141-',
    },
    // {
    //   name: 'avail',
    //   start_block_height: 796700,
    //   app_id: 101,
    // }
  ]
};

  installRequiredLightNodeByElectionIdIfNotExist(election, err => {
    if (err)
      return logger.log('error', err);

  //   saveAllVotesFromBlockHeightToCurrentViaLightNode(election, err => {
  //     if (err)
  //       return logger.log('error', err);

  //     aggregateSavedVotes(election_id, (err, result) => {
  //       if (err)
  //         return logger.log('error', err);

        return logger.log('info', 'result');
  //     });
  //   });
  });
// });
