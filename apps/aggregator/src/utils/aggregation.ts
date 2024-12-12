import { Field, JsonProof, PublicKey, MerkleMap } from 'o1js';

import { AggregationMM, Vote } from 'zkvot-core';

async function base_one (
  data: {
    proof_json: any
  },
  callback: (error: string | null, proof?: JsonProof) => void
) {
  const { proof_json } = data;
  let Proof;

  const merkleMap = new MerkleMap();

  try {
    Proof = (await Vote.Proof.fromJSON(proof_json)).proof as Vote.Proof;
  } catch (error) {
    console.log('Error parsing proofs', error);
    return callback('proof_parse_error');
  }

  const witness = merkleMap.getWitness(Proof.publicOutput.nullifier);

  const PublicInputs = {
    votersRoot: Proof.publicInput.votersRoot,
    electionPubKey: Proof.publicInput.electionPubKey,
  };

  try {
    const proof = (await AggregationMM.Program.base_one(PublicInputs, Proof, witness)).proof;
    return callback(null, proof.toJSON());
  } catch (error) {
    console.log('Error generating proof', error);
    return callback('proof_generation_error');
  }
};

async function append_vote (
  data: {
    previous_proof_json: any,
    proof_json: any,
    previous_voters: {
      vote: number,
      nullifier: string,
    }[]
  },
  callback: (error: string | null, proof?: JsonProof) => void
) {
  const { previous_proof_json, proof_json, previous_voters } = data;
  let PreviousProof, Proof, PreviousVotes;

  try {
    PreviousProof = (await AggregationMM.Proof.fromJSON(previous_proof_json)).proof as AggregationMM.Proof;
    Proof = (await Vote.Proof.fromJSON(proof_json)).proof as Vote.Proof;
  } catch (error) {
    console.log('Error parsing proofs', error);
    return callback('proof_parse_error');
  }

  if (
    PreviousProof.publicInput.votersRoot != Proof.publicInput.votersRoot ||
    PreviousProof.publicInput.electionPubKey != Proof.publicInput.electionPubKey
  )
    return callback('proof_election_mismatch');

  const PublicInputs = {
    votersRoot: PreviousProof.publicInput.votersRoot,
    electionPubKey: PreviousProof.publicInput.electionPubKey,
  };

  const merkleMap = new MerkleMap();

  try {
    PreviousVotes = previous_voters.map(each => {
      return {
        vote: Field.from(each.vote),
        nullifier: Field.from(BigInt(each.nullifier)),
      };
    });
  } catch (error) {
    console.log('Error creating nullifiers', error);
    return callback('nullifier_type_error');
  }

  PreviousVotes.forEach(each => {
    merkleMap.set(each.nullifier, each.vote);
  });

  const witness = merkleMap.getWitness(Proof.publicOutput.nullifier);

  try {
    const proof = (await AggregationMM.Program.append_vote(PublicInputs, PreviousProof, Proof, witness)).proof;
    return callback(null, proof.toJSON());
  } catch (error) {
    console.log('Error generating proof', error);
    return callback('proof_generation_error');
  }
};

export {
  base_one,
  append_vote,
};