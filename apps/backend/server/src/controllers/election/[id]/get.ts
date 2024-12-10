import { Request, Response } from 'express';

import Election from '../../../models/election/Election.js';

export default (
  req: Request,
  res: Response
) => {
  Election.findElectionByContractId(req.params.id, (err, election) => {
    if (err || !election)
      return res.json({ success: false, error: err });

    return res.json({ success: true, election });
  });
};
