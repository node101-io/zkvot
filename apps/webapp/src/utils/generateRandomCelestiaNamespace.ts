import { createHash } from 'node:crypto';

export default () => {
  const seed = Math.random().toString();
  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(18, 0);

  const votingIdHash = createHash('sha256').update(seed).digest();
  const slicedVotingIdHash = votingIdHash.subarray(0, 10);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]).toString('base64');

  return namespaceIdentifier;
};
