import db from '../../../utils/db.js';

export default (
  electionResultsSublevelIdentifier: string,
  electionId: string,
  callback: (err: Error | string | null) => void
) => {
  const electionResultsSublevel = db.sublevel(electionResultsSublevelIdentifier, { valueEncoding: 'json' });

  electionResultsSublevel.get(electionId, (err, electionResult) => {
    if (err && (err as any).code === 'LEVEL_NOT_FOUND')
      return callback('result_not_found');

    if (err)
      return callback(err);

    electionResultsSublevel.del(electionId, err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  });
};
