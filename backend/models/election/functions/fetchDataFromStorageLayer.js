const IPFS_BASE_URI = 'https://ipfs.io/ipfs';
const ARWEAVE_BASE_URI = 'https://arweave.net';

const Platforms = {
  Arweave: "A",
  Filecoin: "F",
  Pinata: "P",
}

const fetchDataFromIPFS = (CID, callback) => {
  const url = `${IPFS_BASE_URI}/${CID}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return callback(null, data);
    })
    .catch(err => {
      console.log(err)
      return callback(err);
    });
}

const fetchDataFromFilecoin = (CID, callback) => {
  const url = `https://${CID}.ipfs.w3s.link`
  console.log(url)

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return callback(null, data);
    })
    .catch(err => {
      console.log(err)
      return callback(err);
    });
}

const fetchDataFromArweave = (CID, callback) => {
  const url = `${ARWEAVE_BASE_URI}/${CID}`;
  console.log(url)
  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return callback(null, data);
    })
    .catch(err => {
      console.log(err)
      return callback(err);
    });
}

function fetchDataFromStorage (platform, id, callback)  {
  if (!platform || typeof platform !== 'string' || platform == '') return callback('bad_request');
  if (!Object.values(Platforms).includes(platform)) return callback('bad_request');

  if(!id || typeof id !== 'string' || id == '') return callback('bad_request');

  if (platform === Platforms.Pinata) {
    fetchDataFromIPFS(id, (err, data) => {
      if (err) return callback(err);

      return callback(null, data);
    });
  } else if (platform === Platforms.Arweave) {
    fetchDataFromArweave(id, (err, data) => {
      if (err) return callback(err);

      return callback(null, data);
    })
  } else if (platform === Platforms.Filecoin) {
    fetchDataFromFilecoin(id, (err, data) => {
      if (err) return callback(err);

      return callback(null, data);
    })
  } else {
    console.log('Unknown platform');

    return callback('bad_request');
  }
}

// fetchDataFromStorage('A', 'e_vsjmojFXdE5naWmdroGcnlpnyS9ULZa8YpMV_Q7xs', (err, data) => {
//   if (err) console.log(err);
//   console.log(data);
// });

module.exports = fetchDataFromStorage;