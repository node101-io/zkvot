import { sha256 } from 'js-sha256';

export default () => {
  const seed = Math.random().toString();
  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(19, 0);
  const votingIdHash = sha256(seed);
  const slicedVotingIdHash = Buffer.from(votingIdHash, 'hex').subarray(0, 8);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]).toString('base64');

  return namespaceIdentifier;
};
