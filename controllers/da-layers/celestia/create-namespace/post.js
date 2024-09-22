const crypto = require('crypto');

module.exports = (req, res) => {
  if (!req.body || typeof req.body != 'object')
    return res.json({ success: false, error: 'bad_request' });

  if (!req.body.voting_id || typeof req.body.voting_id != 'string' || !req.body.voting_id.trim().length)
    return res.json({ success: false, error: 'bad_request' });

  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(18, 0);

  const votingIdHash = crypto.createHash('sha256').update(req.body.voting_id).digest();
  const slicedVotingIdHash = votingIdHash.subarray(0, 10);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]);

  return res.json({ success: true, data: namespaceIdentifier.toString('base64') });
};