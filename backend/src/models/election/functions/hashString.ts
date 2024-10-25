import { Field, Poseidon, PublicKey } from 'o1js';

export default (
  string: any
): bigint => {
  const stringAsHEX = Buffer.from(string, 'utf-8').toString('hex'); 
  const stringAsBigInt = BigInt('0x' + stringAsHEX);
  const stringAsField = new Field(stringAsBigInt);

  return Poseidon.hash([stringAsField]).toBigInt();
};