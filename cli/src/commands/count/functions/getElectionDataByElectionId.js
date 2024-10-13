import logger from "../../../src/utils/logger.js";

const DEFAULT_MINA_RPC_URL = "https://api.minascan.io/node/devnet/v1/graphql";
const STORAGE_LAYERS = {
  Arweave: "A",
  Filecoin: "F",
  Pinata: "P",
};

const getElectionContractStateFromMinaRPC = (data, callback) => {
  if (!data || typeof data !== "object") return callback("data_required");

  if (!data.election_id || typeof data.election_id !== "string" || !data.election_id.length)
    return callback("election_id_required");

  if (!data.mina_rpc_url || typeof data.mina_rpc_url !== "string" || !data.mina_rpc_url.length)
    return callback("mina_rpc_url_required");

    fetch(data.mina_rpc_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetContractState($publicKey: String!) {
            account(publicKey: $publicKey) {
              zkappState
            }
          }
        `,
        variables: {
          publicKey: data.election_id,
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => callback(null, res.data?.account?.zkappState))
      .catch((err) => {
        logger.debug(err);

        return callback("mina_rpc_error");
      });
};

const convertFieldToString = (field) => {
  const hexString = BigInt(field.toString()).toString(16);

  return Buffer.from(hexString, "hex").toString("utf-8");
};

const getElectionDataFromStorageLayer = (fields, callback) => {
  if (!fields || !Array.isArray(fields) || fields.length !== 2)
      return callback("contract_state_required");

  const platform = convertFieldToString(fields[0]).slice(0, 1);
  const id = convertFieldToString(fields[0]).slice(1) + convertFieldToString(fields[1]);

  let url;

  if (platform === STORAGE_LAYERS.Arweave) url = `${ARWEAVE_BASE_URI}/${id}`;
  else if (platform === STORAGE_LAYERS.Filecoin) url = `https://${id}.ipfs.w3s.link`;
  else if (platform === STORAGE_LAYERS.Pinata) url = `${IPFS_BASE_URI}/${id}`;

  if (!url) return callback("invalid_platform");

  fetch(url)
    .then((res) => res.json())
    .then((data) => callback(null, data))
    .catch((err) => {
      logger.debug(err);

      return callback("storage_layer_error");
    });
};

export default (data, callback) => {
  if (!data || typeof data !== "object")
    return callback("data_required");

  if (!data.election_id || typeof data.election_id !== "string" || !data.election_id.length)
    return callback("election_id_required");

  if (!data.mina_rpc_url || typeof data.mina_rpc_url !== "string" || !data.mina_rpc_url.length)
    data.mina_rpc_url = DEFAULT_MINA_RPC_URL;

  getElectionContractStateFromMinaRPC(
    {
      election_id: data.election_id,
      mina_rpc_url: data.mina_rpc_url,
    },
    (err, contract_state) => {
      if (err) return callback(err);

      getElectionDataFromStorageLayer(contract_state.slice(0, 2), (err, election_data) => {
        if (err) return callback(err);

        return callback(null, election_data);
      });
    }
  );
};
