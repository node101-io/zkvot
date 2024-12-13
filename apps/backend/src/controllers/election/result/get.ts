import { Request, Response } from 'express';

import Election from '../../../models/election/Election.js';

export default (
  req: Request,
  res: Response
) => {
  if (!req.query.id || typeof req.query.id !== 'string') {
    res.json({ success: false, error: 'bad_request' });
    return;
  }

  Election.findElectionByContractIdAndGetResults(req.query.id, (err, data) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, data });
  });
};
