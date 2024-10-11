import childProcess from 'child_process';
import os from 'os';
import path from 'path';

import copyDockerFilesToUserFolder from '../../../utils/copyDockerFilesToUserFolder.js';
import createDockerFolderIfNotExists from '../../../utils/createDockerFolderIfNotExists.js';
import db from '../../../utils/db.js';
import logger from '../../../utils/logger.js';

import fetchAuthKeyFromNode from './fetchAuthKeyFromNode.js';

const templateCelestiaComposeFilePath: string = path.join(import.meta.dirname, '../../../../src/da-layers/celestia/light-node/docker-compose.yaml');
const templateCelestiaDockerfileFilePath : string = path.join(import.meta.dirname, '../../../../src/da-layers/celestia/light-node/Dockerfile');

const celestiaDockerFolderPath: string = path.join(os.homedir(), '.zkvot/celestia');
const celestiaComposeFilePath: string= path.join(celestiaDockerFolderPath, 'docker-compose.yaml');
const celestiaDockerfileFilePath: string = path.join(celestiaDockerFolderPath, 'Dockerfile');

const INSTALL_LIGHT_NODE_COMMAND: string = 'docker compose up --detach';

export default (
  data: {
    block_hash: string,
    block_height: number,
  },
  callback: (err: Error | string | null) => void
) => {
  createDockerFolderIfNotExists(celestiaDockerFolderPath, err => {
    if (err)
      return callback(err);

    copyDockerFilesToUserFolder({
      old_path: templateCelestiaComposeFilePath,
      new_path: celestiaComposeFilePath,
      replacements: {
        trusted_block_hash_placeholder: data.block_hash,
        trusted_block_height_placeholder: String(data.block_height)
      }
    }, err => {
      if (err)
        return callback(err);

      copyDockerFilesToUserFolder({
        old_path: templateCelestiaDockerfileFilePath,
        new_path: celestiaDockerfileFilePath
      }, err => {
        if (err)
          return callback(err);

        childProcess.exec(
          INSTALL_LIGHT_NODE_COMMAND,
          { cwd: celestiaDockerFolderPath },
          (err, stdout, stderr) => {
            if (err)
              return callback('terminal_error');

            logger.log('debug', JSON.stringify({
              stderr,
              stdout
            }));

            fetchAuthKeyFromNode((err, authKey) => {
              if (err)
                return callback(err);

              db.put('celestia_auth_key', authKey, err => {
                if (err)
                  return callback(err);

                return callback(null);
              });
            });
          });
      });
    });
  });
};
