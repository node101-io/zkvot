import { Request, Response } from 'express';

import { base_one, append_vote } from '../utils/aggregation.js';

export default (
  req: Request,
  res: Response
) => {
  if (!req.body.proof) {
    res.json({ success: false, error: 'bad_request' });
    return;
  }

  try {
    if (req.body.previous_proof_json) {
      append_vote(req.body, (err, proof) => {
        if (err) {
          res.json({ success: false, error: err });
          return;
        }

        res.json({ success: true, proof });
      });
    } else {
      base_one(req.body, (err, proof) => {
        if (err) {
          res.json({ success: false, error: err });
          return;
        }

        res.json({ success: true, proof });
      });
    }
  } catch (error) {
    console.log('Error', error);
    res.json({ success: false, error: 'bad_request' });
  }
};
