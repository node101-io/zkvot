import { Request, Response } from 'express';

import { types } from 'zkvot-core';

import Election from '../../../models/election/Election.js';

export default (
  req: Request,
  res: Response
) => {
  Election.createElection(req.body, (err: string | null, election?: types.ElectionBackendData) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, election });
  });
};
