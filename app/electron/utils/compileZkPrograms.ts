import { Vote, ElectionContract, RangeAggregationProgram } from 'contracts';

let voteCompiled = false;
let rangeAggregationCompiled = false;
let electionContractCompiled = false;

export const isVoteCompiled = () => voteCompiled;
export const isElectionContractCompiled = () => electionContractCompiled;
export const isRangeAggregationCompiled = () => rangeAggregationCompiled;
export const compileVoteProgram = async () => {
  try {
    if (voteCompiled) return;
    console.time('Vote.compile()');
    await Vote.compile();
    console.timeEnd('Vote.compile()');
    voteCompiled = true;
  } catch (error) {
    console.error(error);
  };
};
export const compileRangeAggregationProgram = async () => {
  try {
    if (rangeAggregationCompiled) return;
    console.time('RangeAggregationProgram.compile()');
    await RangeAggregationProgram.compile();
    console.timeEnd('RangeAggregationProgram.compile()');
    rangeAggregationCompiled = true;
  } catch (error) {
    console.error(error);
  };
};
export const compileElectionContract = async () => {
  try {
    if (electionContractCompiled) return;
    console.time('ElectionContract.compile()');
    await ElectionContract.compile();
    console.timeEnd('ElectionContract.compile()');
    electionContractCompiled = true;
  } catch (error) {
    console.error(error);
  };
};
