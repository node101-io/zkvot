import { JsonProof } from 'o1js';

import db from '../../../utils/db.js';

export default (
  electionResultsSublevelIdentifier: string,
  electionId: string,
  callback: (
    err: Error | string | null,
    aggregatedElectionResult?: {
      electionId: string,
      result: JsonProof
    }
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
