import aggregateSavedVotes from "./functions/aggregateSavedVotes.js";
import getAndSaveElectionDataByElectionIdIfNotExist from "./functions/getAndSaveElectionDataByElectionIdIfNotExist.js";
import installRequiredLightNodeByElectionIdIfNotExists from "./functions/installRequiredLightNodeByElectionIdIfNotExists.js";
import saveAllVotesFromBlockHeightToCurrentViaLightNode from "./functions/saveAllVotesFromBlockHeightToCurrentViaLightNode.js";

import logger from "../../utils/logger.js";

const args = JSON.parse(process.argv[2]);

await new Promise((resolve) => setTimeout(resolve, 1000));

// getAndSaveElectionDataByElectionIdIfNotExist({
//   election_id: args.election_id,
//   mina_rpc_url: args.minaRpc,
// }, (err, election) => {
//   if (err)
//     return logger.log('error', err);

const election = {
  mina_contract_id: 'B62qospDjUj43x2yMKiNehojWWRUsE1wpdUDVpfxH8V3n5Y1QgJKFfw',
  end_block: 0,
  question: 'What is your favorite color?',
  options: ['Red', 'Green', 'Blue'],
  description: 'This is a test election.',
  image_url: 'https://www.google.com',
  image_raw: 'https://www.google.com',
  voters_list: [],
  da_layers: [
    {
      name: 'celestia' as const,
      start_block_height: 2960050,
      start_block_hash: '821CE8B3BFFFD76FEA4666C32495896E26C92271B264D8E490989CBC3227A94C',
      namespace: 'AAAAAAAAAAAAAAAAAAAAAAAAAK0xKC+NMFwlyBM=',
    },
    // {
    //   name: 'avail' as const,
    //   start_block_height: 824285,
    //   app_id: 101,
    // }
  ]
};

// installRequiredLightNodeByElectionIdIfNotExists(election, err => {
//   if (err)
//     return logger.log('error', err);

//   return logger.log('info', 'result');
// });

saveAllVotesFromBlockHeightToCurrentViaLightNode(election, (err: any) => {
  if (err) return logger.log("error", err);

  return logger.log("info", "result");
});

// installRequiredLightNodeByElectionIdIfNotExists(election, err => {
//   if (err)
//     return logger.log('error', err);

// //   saveAllVotesFromBlockHeightToCurrentViaLightNode(election, err => {
// //     if (err)
// //       return logger.log('error', err);

// //     aggregateSavedVotes(election_id, (err, result) => {
// //       if (err)
// //         return logger.log('error', err);

//       return logger.log('info', 'result');
// //     });
// //   });
// });
// });
