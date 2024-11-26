import { EntryStream } from 'level-read-stream';
import { JsonProof } from 'o1js';

import db from '../../../utils/db.js';

export default (
  electionResultsSublevelIdentifier: string,
  callback: (
    err: Error | string | null,
    aggregatedElectionResultsArray?: {
      electionId: string,
      result: JsonProof
    }[]
  ) => void
) => {
  const aggregatedElectionResultsArray: {
    electionId: string,
    result: JsonProof
  }[] = [];

  const electionResultsSublevel = db.sublevel(electionResultsSublevelIdentifier, { valueEncoding: 'json' });

  (new EntryStream(electionResultsSublevel))
    .on('data', entry => {
      aggregatedElectionResultsArray.push({
        electionId: entry.key,
        result: entry.value
      });
    })
    .on('error', err => {
      return callback(err);
    })
    .on('end', () => {
      return callback(null, aggregatedElectionResultsArray);
    });
};
