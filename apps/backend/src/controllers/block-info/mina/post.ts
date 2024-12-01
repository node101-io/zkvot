import { Request, Response } from 'express';

import calculateBlockHeight from '../../../utils/mina/calculateBlockHeightFromTimestamp.js';

export default (
  req: Request,
  res: Response
) => {
  if (!(req.body?.start_date instanceof Date) || !(req.body?.end_date instanceof Date)) {
    res.json({ success: false, error: 'bad_request' });
    return; 
  }

  calculateBlockHeight(req.body.start_date, req.body.end_date)
    .then(blockHeight => {
      res.json({ success: true, data: blockHeight });
    })
    .catch(error => {
      res.json({ success: false, error: error.message });
    });
}