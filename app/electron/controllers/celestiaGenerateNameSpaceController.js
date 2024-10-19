// import { Request, Response } from 'express';
import { createHash } from 'node:crypto';

export default (req, res) => {
  if (!req.query.election_id || typeof req.query.election_id != 'string' || !req.query.election_id.trim().length)
    return res.json({ success: false, error: 'bad_request' });

  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(18, 0);

  const votingIdHash = createHash('sha256').update(req.query.election_id).digest();
  const slicedVotingIdHash = votingIdHash.subarray(0, 10);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]).toString('base64');

  return res.json({ success: true, data: namespaceIdentifier });
};
