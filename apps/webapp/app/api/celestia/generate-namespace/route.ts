import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const election_id = req.nextUrl.searchParams.get('election_id');

  if (!election_id || typeof election_id != 'string' || !election_id.trim().length)
    return NextResponse.json({ success: false, error: 'bad_request' });

  const namespaceVersionByte = Buffer.from([0x00]);

  const leadingZeroBytes = Buffer.alloc(18, 0);

  const votingIdHash = createHash('sha256').update(election_id).digest();
  const slicedVotingIdHash = votingIdHash.subarray(0, 10);

  const namespaceIdentifier = Buffer.concat([
    namespaceVersionByte,
    leadingZeroBytes,
    slicedVotingIdHash
  ]).toString('base64');

  return NextResponse.json({ success: true, data: namespaceIdentifier });
};
