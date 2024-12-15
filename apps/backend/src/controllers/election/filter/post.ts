import { Request, Response } from 'express';
import { z } from 'zod';

import Election from '../../../models/election/Election.js';

const RequestBody = z.object({
  is_devnet: z.boolean().optional(),
  skip: z.number().optional(),
  text: z.string().optional(),
  start_after: z.date().optional(),
  end_before: z.date().optional(),
  is_ongoing: z.boolean().optional()
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

  Election.findElectionsByFilter(data, (err, elections) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, elections: elections || [] });
  });
};
