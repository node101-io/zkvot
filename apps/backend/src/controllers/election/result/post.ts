import { Request, Response } from 'express';
import { z } from 'zod';

import Election from '../../../models/election/Election.js';

const RequestBody = z.object({
  id: z.string()
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

  Election.findElectionByContractIdAndGetResults(data.id, (err, data) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, data });
  });
};
