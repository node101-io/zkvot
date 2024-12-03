import fs from 'fs';
import { VerificationKey } from 'o1js';
import path from 'path';

import { Vote } from 'zkvot-core';

let verificationKey: VerificationKey | void;

const compile = async (force_compile: boolean) => {
  try {
    if (force_compile)
      throw new Error('force compile');

    const verificationKeyFromFile = fs.readFileSync(path.join(import.meta.dirname, '../../VoteVerificationKey.json'), 'utf-8');

    verificationKey = VerificationKey.fromValue(JSON.parse(verificationKeyFromFile, (_key, value) => {
      return typeof value === 'string' && value.startsWith('0x') ? BigInt(value) : value;
    }));
  } catch (error) {
    console.log('Verification key not found, recompiling...');

    verificationKey = await Vote.Program.compile()
      .then(compiled => {
        console.timeEnd('Vote compile');

        return compiled.verificationKey;
      })
      .catch(console.error);
  } finally {
    if (verificationKey)
      fs.writeFileSync(
        path.join(import.meta.dirname, '../../VoteVerificationKey.json'),
        JSON.stringify(VerificationKey.toValue(verificationKey), (_key, value) => {
          return typeof value === 'bigint' ? value.toString() : value
        })
      );
  };
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

export const getVerificationKey = () => verificationKey;

export const compileZkProgramIfNotCompiledBefore = callFunctionOnce(compile);
