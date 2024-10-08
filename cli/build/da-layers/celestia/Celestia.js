import isBase64String from "../../src/utils/isBase64String.js";
import isPortInUse from "../../src/utils/isPortInUse.js";
import celestiaRequest from "./functions/celestiaRequest.js";
import installCelestia from "./functions/installCelestia.js";
import isCelestiaInstalled from "./functions/isCelestiaInstalled.js";
import uninstallCelestia from "./functions/uninstallCelestia.js";
const DEFAULT_RPC_PORT = 10102;
const DEFAULT_RPC_URL = "http://127.0.0.1:10102";
const SYNCING_IN_PROGRESS_ERROR_MESSAGE_REGEX = /header: syncing in progress:/;
const Celestia = {
    init: (data, callback) => {
        if (!data || typeof data != "object")
            return callback("bad_request");
        isPortInUse(DEFAULT_RPC_PORT, (err, inUse) => {
            if (err)
                return callback(err);
            if (!inUse) {
                installCelestia(data, (err, res) => {
                    if (err)
                        return callback(err);
                    return callback(null);
                });
            }
            else {
                isCelestiaInstalled(DEFAULT_RPC_URL, (err, isInstalled) => {
                    if (err)
                        return callback(err);
                    if (!isInstalled) {
                        return callback("port_in_use");
                    }
                    else {
                        return callback(null);
                    }
                });
            }
        });
    },
    getData: (data, callback) => {
        if (!data || typeof data != "object")
            return callback("bad_request");
        if (!data.block_height || isNaN(data.block_height) || Number(data.block_height) < 0)
            return callback("bad_request");
        if (!isBase64String(data.namespace))
            return callback("bad_request");
        celestiaRequest(DEFAULT_RPC_URL, {
            method: "blob.GetAll",
            params: [data.block_height, [data.namespace.trim()]],
        }, (err, res) => {
            if (err)
                return callback(err);
            if (SYNCING_IN_PROGRESS_ERROR_MESSAGE_REGEX.test(res.error?.message))
                return callback("syncing_in_progress");
            return callback(null, res.result);
        });
    },
    uninstall: (callback) => {
        uninstallCelestia((err, res) => {
            if (err)
                return callback(err);
            return callback(null);
        });
    },
};
export default Celestia;
//# sourceMappingURL=Celestia.js.map