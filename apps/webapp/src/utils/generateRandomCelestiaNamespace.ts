import { sha256 } from 'js-sha256';

export default () => {
  const seed = Math.random().toString();
  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(18, 0);

  const votingIdHash = sha256(seed);
  const slicedVotingIdHash = Buffer.from(votingIdHash).subarray(0, 10);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]).toString('base64');

  return namespaceIdentifier;
};
