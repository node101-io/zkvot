import fs from 'fs';
import path from 'path';

import { Aggregation, Vote } from 'zkvot-core';

const compile = async (force_compile: boolean) => {
  console.time('Vote compile');
  Vote.Program.compile()
    .then(() => {
      console.timeEnd('Vote compile');

      console.time('Aggregation compile');
      Aggregation.Program.compile()
        .then(() => {
          console.timeEnd('Aggregation compile');

          console.log('ZK compile successful');
        })
        .catch(console.error);
    })
    .catch(console.error);
};

const callFunctionOnce = (fn: Function) => {
  let called = false;

  return (...args: any[]) => {
    if (!called) {
      called = true;
      return fn.apply(null, args);
    };
  };
};

export const compileZkProgramIfNotCompiledBefore = callFunctionOnce(compile);
