import db from './db.js';

type dbVoteEntry = {
  electionId: string,
  nullifier: string,
  zkProof: object
};

const writeToDB = (
  data: dbVoteEntry,
  callback: (
    err: Error | string | null
  ) => void
) => {
  const electionSublevel = db.sublevel(data.electionId, { valueEncoding: 'json' });

  electionSublevel.put(data.nullifier, data.zkProof, {}, err => {
    if (err)
      return callback(err);

    return callback(null);
  });
};

writeToDB({
  electionId: 'B62qrQiw9JhUumq457sMxicgQ94Z1WD9JChzJu19kBE8Szb5T8tcUAC',
  nullifier: 'Pur',
  zkProof: { vote_proof: 'proof' }
}, (err) => {
  if (err)
    console.log(err);
  else
    console.log('success');
});
