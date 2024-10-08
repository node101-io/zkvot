import aggregateSavedVotes from "./functions/aggregateSavedVotes.js";
import getAndSaveElectionDataByElectionIdIfNotExist from "./functions/getAndSaveElectionDataByElectionIdIfNotExist.js";
import installRequiredLightNodeByElectionIdIfNotExist from "./functions/installRequiredLightNodeByElectionIdIfNotExist.js";
import saveAllVotesFromBlockHeightToCurrentViaLightNode from "./functions/saveAllVotesFromBlockHeightToCurrentViaLightNode.js";

import logger from "../../../src/utils/logger.js";

const args = JSON.parse(process.argv[2]);

await new Promise((resolve) => setTimeout(resolve, 1000));

// getAndSaveElectionDataByElectionIdIfNotExist({
//   election_id: args.election_id,
//   mina_rpc_url: args.minaRpc,
// }, (err, election) => {
//   if (err)
//     return logger.log('error', err);

const election = {
    election_id: "B62qk5sunym3zRih83JroVF3X8AoNnCJJ3yKfsxyj5VCcitZphqmQ5p",
    da_layers: [
        // {
        //   name: 'celestia',
        //   start_block_height: 2808650,
        //   start_block_hash: '821CE8B3BFFFD76FEA4666C32495896E26C92271B264D8E490989CBC3227A94C',
        //   namespace: 'AAAAAAAAAAAAAAAAAAAAAAAAAL89vfs7io/SsSQ=',
        // },
        {
            name: "avail",
            start_block_height: 824285,
            app_id: 101,
        },
    ],
};

// installRequiredLightNodeByElectionIdIfNotExist(election, err => {
//   if (err)
//     return logger.log('error', err);

//   return logger.log('info', 'result');
// });

saveAllVotesFromBlockHeightToCurrentViaLightNode(election, (err: any) => {
    if (err) return logger.log("error", err);

    return logger.log("info", "result");
});

// installRequiredLightNodeByElectionIdIfNotExist(election, err => {
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
