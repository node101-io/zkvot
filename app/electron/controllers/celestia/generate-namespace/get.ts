import { Request, Response } from 'express';
import { createHash } from 'node:crypto';

export default (req: Request, res: Response) => {
  if (!req.query.election_id || typeof req.query.election_id != 'string' || !req.query.election_id.trim().length) {
    res.json({ success: false, error: 'bad_request' });
    return;
  }

  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(18, 0);

  const votingIdHash = createHash('sha256').update(req.query.election_id).digest();
  const slicedVotingIdHash = votingIdHash.subarray(0, 10);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]).toString('base64');

  res.json({ success: true, data: namespaceIdentifier });
};
