import { Request, Response } from 'express';
import { z } from 'zod';

import { types } from 'zkvot-core';

import Election from '../../../models/election/Election.js';

const RequestBody = z.object({
  mina_contract_id: z.string(),
  is_devnet: z.boolean().optional(),
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

  Election.findOrCreateElectionByContractId(data, (err: string | null, election?: types.ElectionBackendData) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, election });
  });
};
