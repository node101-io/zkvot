import { Request, Response } from 'express';
import { Vote, VoteProof } from 'contracts';

const { verificationKey } = await Vote.compile();

export default (req: Request, res: Response) => {
  console.log(verificationKey);

  // TODO: Implement generateVoteProofController
};
