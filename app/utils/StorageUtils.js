export const fetchDataFromIPFS = (CID) => {
  const IPFS_BASE_URI = "https://ipfs.io/ipfs";
  const url = `${IPFS_BASE_URI}/${CID}`;
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch data from IPFS");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Data from IPFS:", data);
      return data;
    })
    .catch((err) => {
      console.error("Error fetching data from IPFS:", err);
      return null;
    });
};

export const fetchDataFromFilecoin = (CID) => {
  const url = `https://${CID}.ipfs.w3s.link`;
  console.log("Filecoin URL:", url);
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch data from Filecoin");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Data from Filecoin:", data);
      return data;
    })
    .catch((err) => {
      console.error("Error fetching data from Filecoin:", err);
      return null;
    });
};

export const fetchDataFromArweave = (CID) => {
  const ARWEAVE_BASE_URI = "https://arweave.net";
  const url = `${ARWEAVE_BASE_URI}/${CID}`;
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch data from Arweave");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Data from Arweave:", data);
      return data;
    })
    .catch((err) => {
      console.error("Error fetching data from Arweave:", err);
      return null;
    });
};
