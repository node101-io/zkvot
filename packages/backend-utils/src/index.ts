import 'dotenv/config';

import Election from './models/election/Election.js';
import ResultProof from './models/result-proof/ResultProof.js';
import Vote from './models/vote/Vote.js';

import aggregate from './utils/aggregate.js';
import decodeFromBase64String from './utils/decodeFromBase64String.js';
import encodeDataToBase64String from './utils/encodeDataToBase64String.js';
import generateRandomHex from './utils/generateRandomHex.js';
import isBase64String from './utils/isBase64String.js';

import availWrite from './utils/da-layers/avail/write.js';
import availRead from './utils/da-layers/avail/read.js';
import availGetSDK from './utils/da-layers/avail/sdk.js';
import availConfig from './utils/da-layers/avail/config.js';

import celestiaWrite from './utils/da-layers/celestia/write.js';
import celestiaRead from './utils/da-layers/celestia/read.js';
import celestiaConfig from './utils/da-layers/celestia/config.js';

const utils = {
  aggregate,
  decodeFromBase64String,
  encodeDataToBase64String,
  generateRandomHex,
  isBase64String,
  avail: {
    write: availWrite,
    read: availRead,
    getSDK: availGetSDK,
    config: availConfig
  },
  celestia: {
    write: celestiaWrite,
    read: celestiaRead,
    config: celestiaConfig
  }
};

export {
  Election,
  ResultProof,
  Vote,
  utils
};
