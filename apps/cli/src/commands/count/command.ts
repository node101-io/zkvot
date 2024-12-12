// import aggregateSavedVotes from './functions/aggregateSavedVotes.js';
import aggregateSavedVotes from './functions/aggregateSavedVotesMM.js';
import getAndSaveElectionDataByElectionIdIfNotExist from './functions/getAndSaveElectionDataByElectionIdIfNotExist.js';
import installRequiredLightNodeByElectionIdIfNotExists from './functions/installRequiredLightNodeByElectionIdIfNotExists.js';
import saveAllVotesFromBlockHeightToCurrentViaLightNode from './functions/saveAllVotesFromBlockHeightToCurrentViaLightNode.js';

import logger from '../../utils/logger.js';

const args = JSON.parse(process.argv[2]);

getAndSaveElectionDataByElectionIdIfNotExist({
  election_id: args.election_id,
  mina_rpc_url: args.minaRpc,
}, (err, election) => {
  if (err || !election) return logger.log('error', err);

  installRequiredLightNodeByElectionIdIfNotExists(election, err => {
    if (err)
      return logger.log('error', err);

    saveAllVotesFromBlockHeightToCurrentViaLightNode(args.election_id, election, err => {
      if (err)
        return logger.log('error', err);

      aggregateSavedVotes(args.election_id, (err) => {
        if (err)
          return logger.log('error', err);

        return logger.log('info', 'Counting is successful. Run \`settle\` command to publish your results on Mina.');
      });
    });
  });
});
