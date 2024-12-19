import { types } from 'zkvot-core';

import writeToAvail from '../../../utils/da-layers/avail/write.js';
import writeToCelestia from '../../../utils/da-layers/celestia/write.js';

export default (
  data: {
    submission_data: types.DaLayerSubmissionData;
    da_layer: types.DaLayerInfo['name'];
    namespace?: string;
    app_id?: number;
  },
  is_devnet: boolean,
  callback: (error: string | null, result?: { blockHeight: number, txHash: string }) => any
) => {
  if (data.da_layer == 'Avail') {
    if (!data.app_id)
      return callback('bad_request');

    writeToAvail(data.submission_data, is_devnet, (err, availResult) => {
      if (err)
        return callback(err);
      if (!availResult)
        return callback('bad_request');

      return callback(null, availResult);
    });
  } else if (data.da_layer == 'Celestia') {
    if (!data.namespace)
      return callback('bad_request');

    writeToCelestia(data.namespace, data.submission_data, is_devnet, (err, celestiaResult) => {
      if (err)
        return callback(err);
      if (!celestiaResult)
        return callback('bad_request');
      return callback(null, {
        txHash: '',
        blockHeight: Number(celestiaResult.blockHeight)
      });
    });
  } else {
    return callback('impossible_error')
  };
};
