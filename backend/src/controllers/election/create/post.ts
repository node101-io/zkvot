import { Request, Response } from 'express';

import Election from '../../../models/election/Election';

export default (
  req: Request,
  res: Response
) => {
  Election.createElection(req.body, (err: string | null, election?: any) => {
    if (err)
      return res.json({ success: false, error: err });
    
    return res.json({ success: true, data: election });
  });
};