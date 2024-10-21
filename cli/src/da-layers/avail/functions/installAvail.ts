import childProcess from 'child_process';
import os from 'os';
import path from 'path';

import copyDockerFilesToUserFolder from '../../../utils/copyDockerFilesToUserFolder.js';
import createDockerFolderIfNotExists from '../../../utils/createDockerFolderIfNotExists.js';
import logger from '../../../utils/logger.js';

const templateAvailComposeFilePath: string = path.join(import.meta.dirname, '../../../../src/da-layers/avail/light-node/docker-compose.yaml');
const templateAvailDockerfileFilePath : string = path.join(import.meta.dirname, '../../../../src/da-layers/avail/light-node/Dockerfile');

const availDockerFolderPath: string = path.join(os.homedir(), '.zkvot/avail');
const availComposeFilePath: string= path.join(availDockerFolderPath, 'docker-compose.yaml');
const availDockerfileFilePath: string = path.join(availDockerFolderPath, 'Dockerfile');

const INSTALL_LIGHT_NODE_COMMAND: string = 'docker compose up --detach';

export default (
  data: {
    app_id: number,
    start_block_height: number
  },
  callback: (err: string | null) => void
) => {
  createDockerFolderIfNotExists(availDockerFolderPath, err => {
    if (err)
      return callback(err);

    copyDockerFilesToUserFolder({
      old_path: templateAvailComposeFilePath,
      new_path: availComposeFilePath,
      replacements: {
        app_id_placeholder: String(data.app_id),
        sync_start_block_placeholder: String(data.start_block_height)
      }
    }, err => {
      if (err)
        return callback(err);

      copyDockerFilesToUserFolder({
        old_path: templateAvailDockerfileFilePath,
        new_path: availDockerfileFilePath
      }, err => {
        if (err)
          return callback(err);

        childProcess.exec(
          INSTALL_LIGHT_NODE_COMMAND,
          { cwd: availDockerFolderPath },
          (err, stdout, stderr) => {
            if (err)
              return callback('terminal_error');

            logger.log('debug', JSON.stringify({
              stderr,
              stdout
            }));

            return callback(null);
          }
        );
      });
    });
  });
};
