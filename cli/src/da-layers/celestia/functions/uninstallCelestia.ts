import childProcess from 'child_process';
import os from 'os';
import path from 'path';

import logger from '../../../utils/logger.js';

const celestiaDockerFolderPath: string = path.join(os.homedir(), '.zkvot/celestia');

const UNINSTALL_LIGHT_NODE_COMMAND: string = 'docker compose down --volumes --rmi all';

export default (callback: (err: string | null) => void) => {
  childProcess.exec(
    UNINSTALL_LIGHT_NODE_COMMAND,
    { cwd: celestiaDockerFolderPath },
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
};
