import { Request, Response } from 'express';

import Election from '../../../models/election/Election.js';

export default (
  req: Request,
  res: Response
) => {
  Election.findElectionsByFilter(req.query, (err, elections) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, elections: elections || [] });
  });
};
