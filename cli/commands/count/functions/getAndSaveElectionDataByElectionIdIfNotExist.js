import db from '../../../utils/db.js';
import getElectionDataByElectionId from './getElectionDataByElectionId.js';

export default (election_id, callback) => {
  db.get(election_id, (err, value) => {
    if (err && err.code === 'LEVEL_NOT_FOUND')
      return callback(null);

    if (err)
      return callback(err);

    getElectionDataByElectionId(election_id, (err, data) => {
      if (err)
        return callback(err);

      db.put(election_id, data, err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  });
};
