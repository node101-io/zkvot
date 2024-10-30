import os from 'os';

import { AvailDaLayerInfo, CelestiaDaLayerInfo } from '../../../types/daLayers.js';
import { Election } from '../../../types/election.js';

import Avail from '../../../da-layers/avail/Avail.js';
import Celestia from '../../../da-layers/celestia/Celestia.js';

import dockerChecker from '../../../utils/dockerChecker.js';
import getDockerInstallationUrlByOsAndArch from '../../../utils/getDockerInstallationUrlByOsAndArch.js';
import logger from '../../../utils/logger.js';

const returnDockerInstallationUrlIfNotLinux = (
  data: {
    arch: string,
    platform: string
  },
  callback: (err: string | null, installationUrl?: string) => void
) => {
  if (data.platform !== 'linux')
    return getDockerInstallationUrlByOsAndArch(data, (err, installationUrl) => {
      if (err)
        return callback(err);

      return callback(null, installationUrl);
    });

  return callback(null);
};

const installAvailLightNodeIfRequired = (
  daLayerInfo: (AvailDaLayerInfo | CelestiaDaLayerInfo)[],
  callback: (err: string | null) => void
) => {
  const availInfo: AvailDaLayerInfo | undefined = (daLayerInfo as AvailDaLayerInfo[]).find(daLayer => daLayer.name === 'avail');

  if (!availInfo)
    return callback(null);

  logger.log('info', 'Installing Avail light node...');

  Avail.init({
    app_id: availInfo.app_id,
    start_block_height: availInfo.start_block_height
  }, err => {
    if (err)
      return callback(err);

    logger.log('info', 'Avail light node installed successfully.');

    return callback(null);
  });
};

const installCelestialLightNodeIfRequired = (
  daLayerInfo: (AvailDaLayerInfo | CelestiaDaLayerInfo)[],
  callback: (err: Error | string | null) => void
) => {
  const celestiaInfo: CelestiaDaLayerInfo | undefined = (daLayerInfo as CelestiaDaLayerInfo[]).find(daLayer => daLayer.name === 'celestia');

  if (!celestiaInfo)
    return callback(null);

  logger.log('info', 'Installing Celestia light node...');

  Celestia.init({
    block_hash: celestiaInfo.start_block_hash,
    block_height: celestiaInfo.start_block_height
  }, err => {
    if (err)
      return callback(err);

    logger.log('info', 'Celestia light node installed successfully.');

    return callback(null);
  });
};

export default (
  election: Election,
  callback: (err: Error | string | null) => void
) => {
  dockerChecker.isInstalled((err, isInstalled) => {
    if (err)
      return callback(err);

    if (!isInstalled) {
      returnDockerInstallationUrlIfNotLinux({
        arch: os.arch(),
        platform: os.platform()
      }, (err, installationUrl) => {
        if (err)
          return callback(err);

        if (!installationUrl) {
          logger.log('warn', 'Please install Docker.');
          return callback('docker_not_installed');
        } else {
          logger.log('warn', `Please install Docker from ${installationUrl}.`);
          return callback('docker_not_installed');
        };
      });
    } else {
      dockerChecker.isActive((err, isActive) => {
        if (err)
          return callback(err);

        if (!isActive) {
          logger.log('warn', 'Please start Docker.');
          return callback('docker_not_active');
        } else {
          installAvailLightNodeIfRequired(election.da_layers, err => {
            if (err)
              return callback(err);

            installCelestialLightNodeIfRequired(election.da_layers, err => {
              if (err)
                return callback(err);

              return callback(null);
            });
          });
        };
      });
    };
  });
};
