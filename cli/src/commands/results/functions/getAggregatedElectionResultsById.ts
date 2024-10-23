import db from '../../../utils/db.js';

import { AggregatedElectionResult } from '../../../types/election.js';
import { JsonProof, PublicKey } from 'o1js';

export default (
  electionResultsSublevelIdentifier: string,
  electionId: PublicKey,
  callback: (
    err: Error | string | null,
    aggregatedElectionResult?: AggregatedElectionResult
  ) => void
) => {
  const electionResultsSublevel = db.sublevel(electionResultsSublevelIdentifier, { valueEncoding: 'json' });

  electionResultsSublevel.get(electionId, { valueEncoding: 'json' }, (err, electionResult?: JsonProof) => {
    if (err && (err as any).code === 'LEVEL_NOT_FOUND')
      return callback('result_not_found');

    if (err)
      return callback(err);

    if (!electionResult)
      return callback(null);

    return callback(null, { electionId, result: electionResult });
  });
};
