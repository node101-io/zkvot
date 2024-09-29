import child_process from 'child_process';
import os from 'os';
import path from 'path';

import copyDockerFilesToUserFolder from '../../../utils/copyDockerFilesToUserFolder.js';
import createDockerFolderIfDoesntExist from '../../../utils/createDockerFolderIfDoesntExist.js';

const templateComposeFilePath = path.join(import.meta.dirname, '../light-node/docker-compose.yaml');
const templateDockerfilePath = path.join(import.meta.dirname, '../light-node/Dockerfile');

const availDockerFolderPath = path.join(os.homedir(), '.zkvot/avail');
const availComposeFilePath = path.join(availDockerFolderPath, 'docker-compose.yaml');
const availDockerfilePath = path.join(availDockerFolderPath, 'Dockerfile');

const INSTALL_LIGHT_NODE_COMMAND = 'docker compose up --detach';
const LIGHT_NODE_ALREADY_INSTALLED_REGEX = /Container (.*?) Running/;

export default (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.app_id || isNaN(data.app_id) || Number(data.app_id) < 0)
    return callback('bad_request');

  if (!data.block_height || isNaN(data.block_height) || Number(data.block_height) < 0)
    return callback('bad_request');

  createDockerFolderIfDoesntExist(availDockerFolderPath, err => {
    if (err)
      return callback(err);

    copyDockerFilesToUserFolder({
      old_path: templateComposeFilePath,
      new_path: availComposeFilePath,
      replacements: {
        app_id_placeholder: data.app_id,
        sync_start_block_placeholder: data.block_height
      }
    }, err => {
      if (err)
        return callback(err);

      copyDockerFilesToUserFolder({
        old_path: templateDockerfilePath,
        new_path: availDockerfilePath
      }, err => {
        if (err)
          return callback(err);

        child_process.exec(
          INSTALL_LIGHT_NODE_COMMAND,
          { cwd: availDockerFolderPath },
          (err, stdout, stderr) => {
            if (err)
              return callback(err);

            console.log(stdout, stderr);

            if (LIGHT_NODE_ALREADY_INSTALLED_REGEX.test(stderr))
              return callback('already_installed');

            return callback(null);
          }
        );
      });
    });
  });
};