import logger from '../../../utils/logger.js';

// TODO: implement this function
export default async (data, callback) => {
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
