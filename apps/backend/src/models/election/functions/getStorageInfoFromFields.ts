import { Field } from 'o1js';

const Platforms = {
  Arweave: 'A',
  Filecoin: 'F',
  Pinata: 'P',
};

const convertFieldToString = (
  field: Field
): string => {
  let hexString = BigInt(field.toString()).toString(16);
  return Buffer.from(hexString, 'hex').toString('utf-8');
};

export default (
  fields: [Field, Field],
  callback: (
    error: string | null,
    storageInfo?: {
      id: string,
      platform: string
    }
  ) => any
) => {
  
  const platform = convertFieldToString(fields[0]).slice(0,1);

  if (!Object.values(Platforms).includes(platform))
    return callback('bad_request');

  const id = convertFieldToString(fields[0]).slice(1) + convertFieldToString(fields[1]);

  return {
    id,
    platform
  };
};