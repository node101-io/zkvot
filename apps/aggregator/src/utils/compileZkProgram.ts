import { AggregationMM as Aggregation, Vote } from 'zkvot-core';

let isCompiled: boolean = false;

export const isZkProgramCompiled = () => isCompiled;

export const compileZkProgramIfNotCompiledBefore = async () => {
  if (isCompiled) return;

  try {
    console.time('Vote compile');
    await Vote.Program.compile()
    console.timeEnd('Vote compile');

    console.time('Aggregation compile');
    await Aggregation.Program.compile()
    console.timeEnd('Aggregation compile');

    console.log('ZK compile successful');
    isCompiled = true;
  } catch (error) {
    console.error('ZK compile failed', error);
  };
};
