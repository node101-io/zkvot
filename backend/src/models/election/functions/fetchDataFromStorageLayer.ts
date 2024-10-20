import { ElectionState } from '../../../types/election';

const IPFS_BASE_URI = 'https://ipfs.io/ipfs';
const ARWEAVE_BASE_URI = 'https://arweave.net';

const Platforms = {
  Arweave: 'A',
  Filecoin: 'F',
  Pinata: 'P',
};

const fetchDataFromIPFS = (
  CID: string,
  callback: (error: string | null, data?: ElectionState) => any
) => {
  const url = `${IPFS_BASE_URI}/${CID}`;

  fetch(url)
    .then(res => res.json())
    .then((data: ElectionState) => callback(null, data))
    .catch(_ => callback('bad_request'));
};

const fetchDataFromFilecoin = (
  CID: string,
  callback: (error: string | null, data?: ElectionState) => any
) => {
  const url = `https://${CID}.ipfs.w3s.link`;

  fetch(url)
    .then(res => res.json())
    .then((data: ElectionState) => callback(null, data))
    .catch(_ => callback('bad_request'));
};

const fetchDataFromArweave = (
  CID: string,
  callback: (error: string | null, data?: any) => any
) => {
  const url = `${ARWEAVE_BASE_URI}/${CID}`;

  fetch(url)
    .then(res => res.json())
    .then((data: ElectionState) => callback(null, data))
    .catch(_ => callback('bad_request'));
};

function fetchDataFromStorage (
  platform: string,
  id: string,
  callback: (
    error: string | null,
    data?: ElectionState
  ) => any
)  {
  if (!platform || typeof platform !== 'string' || platform == '')
    return callback('bad_request');
  if (!Object.values(Platforms).includes(platform))
    return callback('bad_request');

  if(!id || typeof id !== 'string' || id == '')
    return callback('bad_request');

  if (platform === Platforms.Pinata) {
    fetchDataFromIPFS(id, (err, data) => {
      if (err) return callback(err);

      return callback(null, data);
    });
  } else if (platform === Platforms.Arweave) {
    fetchDataFromArweave(id, (err, data) => {
      if (err) return callback(err);

      return callback(null, data);
    });
  } else if (platform === Platforms.Filecoin) {
    fetchDataFromFilecoin(id, (err, data) => {
      if (err) return callback(err);

      return callback(null, data);
    });
  } else {
    return callback('bad_request');
  };
};

// fetchDataFromStorage('A', 'e_vsjmojFXdE5naWmdroGcnlpnyS9ULZa8YpMV_Q7xs', (err, data) => {
//   if (err) console.log(err);
//   console.log(data);
// });

export default fetchDataFromStorage;