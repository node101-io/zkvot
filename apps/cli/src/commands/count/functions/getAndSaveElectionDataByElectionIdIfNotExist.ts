import {
  Election,
  types,
  utils
} from 'zkvot-core';

import db from '../../../utils/db.js';

const MINA_RPC_URL = process.env.NODE_ENV == 'production' ? 'https://api.minascan.io/node/mainnet/v1/graphql' : 'https://api.minascan.io/node/devnet/v1/graphql';

export default (
  data: {
    election_id: string;
    mina_rpc_url?: string;
  },
  callback: (err: string | null, election_data?: types.ElectionStaticData) => void
) => {
  db.get(data.election_id, (err: any, value) => {
    if (err && err.code !== 'LEVEL_NOT_FOUND') return callback(err);

    Election.fetchElectionState(data.election_id, data.mina_rpc_url || MINA_RPC_URL, (err, election_state) => {
      if (err || !election_state) return callback(err);

      const storageLayerInfoDecoding = utils.decodeStorageLayerInfo(election_state.storageLayerInfoEncoding);

      utils.fetchDataFromStorageLayer(storageLayerInfoDecoding, (err, election_data) => {
        if (err || !election_data) return callback(err);

        db.put(data.election_id, election_data, (err) => {
          if (err) return callback(err.toString());

          return callback(null, election_data);
        });
      });
    });
  });
};
