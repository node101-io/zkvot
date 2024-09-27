import logger from '../../../utils/logger.js';

// TODO: implement this function
export default (election_id, callback) => {
  // election structure'ına göre gerekli da'ler kurulacak

  // simulation
  logger.log('info', 'installing required light node');

  setTimeout(() => {
    logger.log('info', 'installed required light node');

    return callback(null);
  }, 4000);
};
