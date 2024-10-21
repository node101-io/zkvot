import { EntryStream } from 'level-read-stream';

import db from '../../../utils/db.js';

import { AggregatedElectionResult } from '../../../types/election.js';

export default (
  electionResultsSublevelIdentifier: string,
  callback: (
    err: Error | string | null,
    aggregatedElectionResultsArray?: AggregatedElectionResult[]
  ) => void
) => {
  const aggregatedElectionResultsArray: AggregatedElectionResult[] = [];

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
