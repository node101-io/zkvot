// import { Level } from 'level';

// import readFromAvail from '../../utils/da-layers/avail/read.js';
// import readFromCelestia from '../../utils/da-layers/celestia/read.js';

// const db = new Level('../data', { valueEncoding: 'json' });

// export default async () => {
//   const lastReadBlockAvail = Number(await db.get('last_read_block_avail'));
//   const lastReadBlockCelestia = Number(await db.get('last_read_block_celestia'));

//   readFromAvail(lastReadBlockAvail + 1, true, async (err, data) => {
//     if (err)
//       console.error(err);

//     await db.put(`avail_${lastReadBlockAvail + 1}`, JSON.stringify(data));

//     await db.put('last_read_block_avail', String(lastReadBlockAvail + 1));


//   });
// };

// /*
// countNewVotesInDA => dk'da 1 çalışıyor
//   GetLastReadBlock() // <<< 1 sn
//   ReadFromAvail and Celestia (with last read block) // Timely, ama önemli değil
//   Insert read data to LevelDB (only type verification) // < 1 sn
//   SetLastReadBlock() // <<< 1 sn
//   async.times (Level DB üzerinden çağır, run function 1 times olarak)
//     Valid oylar Vote modelinde yaratıyor (createVote)
// */
