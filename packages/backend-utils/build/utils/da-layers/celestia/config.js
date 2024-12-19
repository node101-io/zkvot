if (!process.env.CELESTIA_AUTH_TOKEN_TESTNET)
    console.warn('CELESTIA_AUTH_TOKEN_TESTNET environment variable not set');
if (!process.env.CELESTIA_AUTH_TOKEN_MAINNET)
    console.warn('CELESTIA_AUTH_TOKEN_MAINNET environment variable not set');
const testnet = {
    authToken: process.env.CELESTIA_AUTH_TOKEN_TESTNET,
    defaultTxFee: process.env.CELESTIA_TX_FEE_TESTNET || 0.002,
    localEndpoint: process.env.CELESTIA_LOCAL_ENDPOINT_TESTNET || 'http://127.0.0.1:10102',
    rpcEndpoint: process.env.CELESTIA_RPC_ENDPOINT_TESTNET || 'https://rpc-mocha.pops.one'
};
const mainnet = {
    authToken: process.env.CELESTIA_AUTH_TOKEN_MAINNET,
    defaultTxFee: process.env.CELESTIA_TX_FEE_MAINNET || 0.002,
    localEndpoint: process.env.CELESTIA_LOCAL_ENDPOINT_MAINNET || 'http://127.0.0.1:10103',
    rpcEndpoint: process.env.CELESTIA_RPC_ENDPOINT_MAINNET || 'https://rpc.celestia.pops.one'
};
export default { testnet, mainnet };
//# sourceMappingURL=config.js.map