import { Level } from 'level';
import winston from 'winston';

const db = new Level('./db', { valueEncoding: 'json' });

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
});

// error
// logger.log('error', 'error message');
// // warn
// logger.log('warn', 'warn message');
// // help
// logger.log('info', 'info message');
// // debug
// logger.log('debug', 'debug message');

const getAndSaveElectionDataByElectionIdIfNotExist = (election_id, callback) => {
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

// TODO: implement this function
const getElectionDataByElectionId = (election_id, callback) => {
  // get from mina by id, get ctract state by id (via rpc, or contract code)

  // then get from filecoin by cip

  return callback(null, {

  });
};

// TODO: implement this function
const installRequiredLightNodeByElectionIdIfNotExist = (election_id, callback) => {
  // election structure'ına göre gerekli da'ler kurulacak

  // simulation
  logger.log('info', 'installing required light node');

  setTimeout(() => {
    logger.log('info', 'installed required light node');

    return callback(null);
  }, 4000);
};

// TODO: implement this function
const saveAllVotesFromBlockHeightToCurrentViaLightNode = async (data, callback) => {
  // data.block_height
  // data.namespace

  // simulation
  for (let i = 0; i < 5; i++) {
    logger.log('info', `saving votes from block height ${i}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    logger.log('info', `saved votes from block height ${i}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  return callback(null);
};

// TODO: implement this function
const aggregateSavedVotes = (election_id, callback) => {

  return callback(null);
};

export default (election_id, options) => {
  getAndSaveElectionDataByElectionIdIfNotExist(election_id, (err, election) => {
    if (err)
      return logger.log('error', err);

    installRequiredLightNodeByElectionIdIfNotExist(election, err => {
      if (err)
        return logger.log('error', err);

      saveAllVotesFromBlockHeightToCurrentViaLightNode(election, err => {
        if (err)
          return logger.log('error', err);

        aggregateSavedVotes(election_id, (err, result) => {
          if (err)
            return logger.log('error', err);

          return logger.log('info', result);
        });
      });
    });
  });
};
