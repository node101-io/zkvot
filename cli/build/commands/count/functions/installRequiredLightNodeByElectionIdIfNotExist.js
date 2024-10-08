import os from "os";
import Avail from "../../../da-layers/avail/Avail.js";
import Celestia from "../../../da-layers/celestia/Celestia.js";
import Docker from "../../../src/docker/Docker.js";
import getDockerInstallationUrlByOsAndArch from "../../../src/utils/getDockerInstallationUrlByOsAndArch.js";
import logger from "../../../src/utils/logger.js";
const DA_LAYERS = ["avail", "celestia"];
const returnDockerInstallationUrlIfNotLinux = (data, callback) => {
    if (!data || typeof data != "object")
        return callback("bad_request");
    if (data.platform != "linux") {
        getDockerInstallationUrlByOsAndArch(data, (err, installationUrl) => {
            if (err)
                return callback(err);
            return callback(null, installationUrl);
        });
    }
    return callback(null);
};
const installAvailLightNodeIfRequired = (daLayerInfo, callback) => {
    if (!daLayerInfo || !Array.isArray(daLayerInfo))
        return callback("bad_request");
    const availInfo = daLayerInfo.find((item) => typeof item === "object" && item.name === "avail");
    if (!availInfo)
        return callback(null);
    if (!availInfo.app_id || isNaN(availInfo.app_id) || Number(availInfo.app_id) < 0)
        return callback("bad_request");
    if (!availInfo.start_block_height ||
        isNaN(availInfo.start_block_height) ||
        Number(availInfo.start_block_height) < 0)
        return callback("bad_request");
    logger.log("info", "Installing Avail light node...");
    Avail.init({
        app_id: availInfo.app_id,
        start_block_height: availInfo.start_block_height,
    }, (err) => {
        if (err)
            return callback(err);
        logger.log("info", "Installed Avail light node.");
        return callback(null);
    });
};
const installCelestiaLightNodeIfRequired = (daLayerInfo, callback) => {
    if (!daLayerInfo || !Array.isArray(daLayerInfo))
        return callback("bad_request");
    const celestiaInfo = daLayerInfo.find((item) => typeof item === "object" && item.name === "celestia");
    if (!celestiaInfo)
        return callback(null);
    if (!celestiaInfo.start_block_hash || typeof celestiaInfo.start_block_hash != "string")
        return callback("bad_request");
    if (!celestiaInfo.start_block_height ||
        isNaN(celestiaInfo.start_block_height) ||
        Number(celestiaInfo.start_block_height) < 0)
        return callback("bad_request");
    logger.log("info", "Installing Celestia light node...");
    Celestia.init({
        block_hash: celestiaInfo.start_block_hash,
        block_height: celestiaInfo.start_block_height,
    }, (err) => {
        if (err)
            return callback(err);
        logger.log("info", "Installed Celestia light node.");
        return callback(null);
    });
};
export default (election, callback) => {
    if (!election || typeof election != "object")
        return callback("bad_request");
    for (const layer of election.da_layers)
        if (!layer || typeof layer != "object" || !DA_LAYERS.includes(layer.name))
            return callback("bad_request");
    Docker.isInstalled((err, isInstalled) => {
        if (err)
            return callback(err);
        if (!isInstalled) {
            returnDockerInstallationUrlIfNotLinux({
                platform: os.platform(),
                arch: os.arch(),
            }, (err, installationUrl) => {
                if (err)
                    return callback(err);
                if (installationUrl) {
                    logger.log("warn", `Please install Docker from ${installationUrl}.`);
                    return callback("docker_not_installed");
                }
                logger.log("warn", "Please install Docker.");
                return callback("docker_not_installed");
            });
        }
        else {
            Docker.isActive((err, isActive) => {
                if (err)
                    return callback(err);
                if (!isActive) {
                    logger.log("warn", "Please start Docker.");
                    return callback("docker_not_active");
                }
                else {
                    installAvailLightNodeIfRequired(election.da_layers, (err) => {
                        if (err)
                            return callback(err);
                        installCelestiaLightNodeIfRequired(election.da_layers, (err) => {
                            if (err)
                                return callback(err);
                            return callback(null);
                        });
                    });
                }
            });
        }
    });
};
//# sourceMappingURL=installRequiredLightNodeByElectionIdIfNotExist.js.map