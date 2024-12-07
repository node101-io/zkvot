import { Field, Poseidon } from 'o1js';

import Election from './Election.js';

import {
  fetchDataFromArweave,
  fetchDataFromFilecoin,
  fetchDataFromIPFS
} from './utils/storageLayer.js';

import types from './types.js';

namespace utilsNamespace {
  const convertFieldToString = (
    field: Field
  ): string => {
    let hexString = BigInt(field.toString()).toString(16);
    return Buffer.from(hexString, 'hex').toString('utf-8');
  };

  const convertStringToField = (
    str: string
  ): Field => {
    const hexString = Buffer.from(str, 'utf-8').toString('hex');
    return new Field(BigInt('0x' + hexString));
  };

  export const StorageLayerPlatformDecoding: Record<types.StorageLayerPlatformCodes, types.StorageLayerPlatformNames> = {
    A: 'Arweave',
    F: 'Filecoin',
  };
  export const StorageLayerPlatformEncoding: Record<types.StorageLayerPlatformNames, types.StorageLayerPlatformCodes> = {
    Arweave: 'A',
    Filecoin: 'F',
  };

  export const encodeStorageLayerInfo = (
    platform: types.StorageLayerPlatformCodes,
    id: string
  ): Election.StorageLayerInfoEncoding => {
    const infoToEncode = platform + id;
  
    return new Election.StorageLayerInfoEncoding({
      first: convertStringToField(infoToEncode.slice(0, infoToEncode.length / 2)),
      last: convertStringToField(infoToEncode.slice(infoToEncode.length / 2))
    });
  };

  export const decodeStorageLayerInfo = (
    storageLayerInfoEncoding: Election.StorageLayerInfoEncoding
  ): {
    platform: string,
    id: string
  } => {
    const platform = convertFieldToString(storageLayerInfoEncoding.first).slice(0, 1);
    const id = convertFieldToString(storageLayerInfoEncoding.first).slice(1) + convertFieldToString(storageLayerInfoEncoding.last);

    return {
      platform,
      id
    };
  };

  export const fetchDataFromStorageLayer = (
    data: {
      platform: string,
      id: string,
    },
    callback: (
      error: string | null,
      data?: types.ElectionStaticData
    ) => any
  ) => {
    const { platform, id } = data;

    if (platform === StorageLayerPlatformEncoding.Arweave) {
      fetchDataFromArweave(id, (err, data) => {
        if (err) return callback(err);

        return callback(null, data);
      });
    } else if (platform === StorageLayerPlatformEncoding.Filecoin) {
      fetchDataFromFilecoin(id, (err, data) => {
        if (err) return callback(err);

        return callback(null, data);
      });
    } else {
      return callback('bad_request');
    };
  };

  export const poseidonHashString = (
    string: any
  ): bigint => {
    const stringAsHEX = Buffer.from(string, 'utf-8').toString('hex');
    const stringAsBigInt = BigInt('0x' + stringAsHEX);
    const stringAsField = new Field(stringAsBigInt);

    return Poseidon.hash([stringAsField]).toBigInt();
  };

  export const convertElectionStaticDataToBackendData = (
    mina_contract_id: string,
    storage_layer_id: string,
    storage_layer_platform: types.StorageLayerPlatformCodes,
    electionData: types.ElectionStaticData
  ): types.ElectionBackendData => {
    return {
      mina_contract_id,
      storage_layer_id,
      storage_layer_platform,
      start_date: electionData.start_date,
      end_date: electionData.end_date,
      question: electionData.question,
      options: electionData.options,
      description: electionData.description,
      image_url: electionData.image_raw,
      voters_list: electionData.voters_list,
      voters_merkle_root: BigInt(0),
      communication_layers: electionData.communication_layers
    }
  };
};;

export default utilsNamespace;
