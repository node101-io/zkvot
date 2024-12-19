import { Request, Response } from 'express';

import { base_one, append_vote } from '../utils/aggregation.js';
import { isZkProgramCompiled } from '../utils/compileZkProgram.js';

export default (
  req: Request,
  res: Response
) => {
  if (!isZkProgramCompiled()) {
    res.json({ success: false, error: 'not_compiled' });
    return;
  };

  if (!req.body.proof_json) {
    res.json({ success: false, error: 'bad_request' });
    return;
  };

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
  };
};
