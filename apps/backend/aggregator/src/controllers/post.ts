import { Request, Response } from 'express';

import { base_empty, base_one, append_vote } from '../utils/aggregation.js';

export default (
  req: Request,
  res: Response
) => {
  if (!req.body.proof)
    return res.json({ success: false, error: 'bad_request' });

  try {
    if (req.body.previous_proof_json) {
      append_vote(req.body, (err, proof) => {
        if (err)
          return res.json({ success: false, error: err });

        return res.json({ success: true, proof });
      });
    } else if (req.body.proof_json) {
      base_one(req.body, (err, proof) => {
        if (err)
          return res.json({ success: false, error: err });

        return res.json({ success: true, proof });
      });
    } else {
      base_empty(req.body, (err, proof) => {
        if (err)
          return res.json({ success: false, error: err });

        return res.json({ success: true, proof });
      });
    }
  } catch (error) {
    console.log('Error', error);
    return res.json({ success: false, error: 'bad_request' });
  }
};
