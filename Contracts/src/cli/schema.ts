import mongoose, { Schema } from 'mongoose';

export interface IAggregateProof {
  includedVotesHash: string;
  proof: string;
}

const aggregateProofSchema = new Schema(
  {
    includedVotesHash: { type: String, required: true, unique: true },
    proof: { type: String, required: true },
  },
  { versionKey: false }
);

export const CachedProofs = mongoose.model<IAggregateProof>(
  'CachedProofs',
  aggregateProofSchema
);
