import validator from "validator";
import db from "../../../src/utils/db.js";
const DEFAULT_MAX_TEXT_FIELD_LENGTH = 1e4;
const DATA_NOT_FOUND_ERROR_MESSAGE_REGEX = /blob: not found/;
const WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX = /account (.*?) not/;
export default (url, options, callback) => {
    if (!url || !validator.isURL(url.toString()))
        return callback("bad_request");
    if (!options || typeof options != "object")
        return callback("bad_request");
    if (!options.method ||
        typeof options.method != "string" ||
        !options.method.trim().length ||
        options.method.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH)
        return callback("bad_request");
    if (!options.params || !Array.isArray(options.params))
        return callback("bad_request");
    db.get("celestia_auth_key", (err, value) => {
        if (err && err.code == "LEVEL_NOT_FOUND")
            return callback("key_not_found");
        if (err)
            return callback(err);
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + value,
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: options.method,
                params: options.params,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
            return callback(null, res);
        })
            .catch((err) => {
            if (DATA_NOT_FOUND_ERROR_MESSAGE_REGEX.test(err))
                return callback("data_not_found");
            if (WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX.test(err))
                return callback("wallet_not_funded");
            return callback("fetch_error");
        });
    });
};
//# sourceMappingURL=celestiaRequest.js.map