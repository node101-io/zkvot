import { Request, Response } from 'express';

import calculateBlockHeight from '../../../utils/mina/calculateBlockHeightFromTimestamp.js';

export default (
  req: Request,
  res: Response
) => {
  if (!req.body?.start_date || !req.body?.end_date)
    res.json({ success: false, error: 'bad_request' });

  const start_date = new Date(req.body.start_date);
  const end_date = new Date(req.body.end_date);

  if (isNaN(start_date.getTime()) || isNaN(end_date.getTime()))
    res.json({ success: false, error: 'bad_request' });

  calculateBlockHeight(start_date, end_date)
    .then(blockHeight => {
      console.log('Block height:', blockHeight);
      res.json({ success: true, data: blockHeight });
    })
    .catch(error => {
      res.json({ success: false, error: error.message });
    });
}
