import { Request, Response } from 'express';
import { z } from 'zod';

import { types } from 'zkvot-core';

import Vote from '../../../models/vote/Vote.js';

const RequestBody = z.object({
  is_devnet: z.boolean(),
  da_layer_submission_data: z.custom<types.DaLayerSubmissionData>(),
  election_contract_id: z.string(),
  da_layer: z.custom<types.DaLayerInfo["name"]>(),
});

export default (
  req: Request,
  res: Response
) => {
  const { success, data } = RequestBody.safeParse(req.body);

  if (!success || !data) {
    res.json({ success: false, error: 'bad_request' });
    return;
  };

  Vote.createAndSubmitVote(data, (err, vote) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, vote });
  });
};
