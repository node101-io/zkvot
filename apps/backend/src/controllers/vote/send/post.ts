import { Request, Response } from 'express';

import Vote from '../../../models/vote/Vote.js';

export default (
  req: Request,
  res: Response
) => {
  Vote.createAndSubmitVote(req.body, (err, vote) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, vote });
  });
};
