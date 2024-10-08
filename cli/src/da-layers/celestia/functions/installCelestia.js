import child_process from "child_process";
import os from "os";
import path from "path";

import fetchAuthKeyFromNode from "./fetchAuthKeyFromNode.js";

import copyDockerFilesToUserFolder from "../../../src/utils/copyDockerFilesToUserFolder.js";
import createDockerFolderIfDoesntExist from "../../../src/utils/createDockerFolderIfDoesntExist.js";
import db from "../../../src/utils/db.js";
import logger from "../../../src/utils/logger.js";

const templateComposeFilePath = path.join(import.meta.dirname, "../light-node/docker-compose.yaml");
const templateDockerfilePath = path.join(import.meta.dirname, "../light-node/Dockerfile");

const celestiaDockerFolderPath = path.join(os.homedir(), ".zkvot/celestia");
const celestiaComposeFilePath = path.join(celestiaDockerFolderPath, "docker-compose.yaml");
const celestiaDockerfilePath = path.join(celestiaDockerFolderPath, "Dockerfile");

const INSTALL_LIGHT_NODE_COMMAND = "docker compose up --detach";
const LIGHT_NODE_ALREADY_INSTALLED_REGEX = /Container (.*?) Running/;

export default (data, callback) => {
    if (!data || typeof data != "object") return callback("bad_request");

    if (!data.block_hash || typeof data.block_hash != "string" || !data.block_hash.trim().length)
        return callback("bad_request");

    if (!data.block_height || isNaN(data.block_height) || Number(data.block_height) < 0)
        return callback("bad_request");

    createDockerFolderIfDoesntExist(celestiaDockerFolderPath, (err) => {
        if (err) return callback(err);

        copyDockerFilesToUserFolder(
            {
                old_path: templateComposeFilePath,
                new_path: celestiaComposeFilePath,
                replacements: {
                    trusted_block_hash_placeholder: data.block_hash,
                    trusted_block_height_placeholder: data.block_height,
                },
            },
            (err) => {
                if (err) return callback(err);

                copyDockerFilesToUserFolder(
                    {
                        old_path: templateDockerfilePath,
                        new_path: celestiaDockerfilePath,
                    },
                    (err) => {
                        if (err) return callback(err);

                        child_process.exec(
                            INSTALL_LIGHT_NODE_COMMAND,
                            { cwd: celestiaDockerFolderPath },
                            (err, stdout, stderr) => {
                                if (err) return callback(err);

                                logger.log(
                                    "debug",
                                    JSON.stringify({
                                        stderr,
                                        stdout,
                                    })
                                );

                                if (LIGHT_NODE_ALREADY_INSTALLED_REGEX.test(stdout))
                                    return callback(null);

                                fetchAuthKeyFromNode((err, auth_key) => {
                                    if (err) return callback(err);

                                    db.put("celestia_auth_key", auth_key, (err) => {
                                        if (err) return callback(err);

                                        return callback(null);
                                    });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};
