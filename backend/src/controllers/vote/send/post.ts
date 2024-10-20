import { Request, Response } from 'express';

import Vote from '../../../models/vote/Vote';

export default (
  req: Request,
  res: Response
) => {
  Vote.createAndSubmitVote(req.body, (err, result) => {
    if (err)
      return res.json({ success: false, error: err });
    
    return res.json({ success: true, result });
  });
};