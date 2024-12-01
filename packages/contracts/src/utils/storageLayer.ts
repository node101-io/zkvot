import types from '../types.js';

type ElectionStaticData = types.ElectionStaticData;

export const fetchDataFromIPFS = (
  CID: string,
  callback: (error: string | null, data?: ElectionStaticData) => any
) => {
  const url = `https://ipfs.io/ipfs/${CID}`;

  fetch(url)
    .then(res => res.json())
    .then((data: ElectionStaticData) => callback(null, data))
    .catch(_ => callback('bad_request'));
};

export const fetchDataFromFilecoin = (
  CID: string,
  callback: (error: string | null, data?: ElectionStaticData) => any
) => {
  const url = `https://${CID}.ipfs.w3s.link`;

  fetch(url)
    .then(res => res.json())
    .then((data: ElectionStaticData) => callback(null, data))
    .catch(_ => callback('bad_request'));
};

export const fetchDataFromArweave = (
  CID: string,
  callback: (error: string | null, data?: any) => any
) => {
  const url = `https://arweave.net/${CID}`;

  fetch(url)
    .then(res => res.json())
    .then((data: ElectionStaticData) => callback(null, data))
    .catch(_ => callback('bad_request'));
};