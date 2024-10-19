const encodeDataToBase64String = require('../../encodeDataToBase64String');

const CELESTIA_RPC_URL = process.env.CELESTIA_RPC_URL || 'http://127.0.0.1:10102';
const CELESTIA_AUTH_TOKEN = process.env.CELESTIA_AUTH_TOKEN;
const DEFAULT_TX_FEE = 0.002;

module.exports = (namespace, zkProof, callback) => {
  encodeDataToBase64String(zkProof, (error, encodedZkProof) => {
    if (error) return callback(error);

    fetch(CELESTIA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CELESTIA_AUTH_TOKEN}`
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'blob.Submit',
        params: [
          [
            {
              namespace: namespace.trim(),
              data: encodedZkProof.trim()
            }
          ],
          {
            gas_price: DEFAULT_TX_FEE
          }
        ]
      })
    })
    .then(res => res.json())
    .then(jsonRes => callback(null, { blockHeight: jsonRes.result }))
    .catch(_ => callback('da_layer_error'));
  });
};
