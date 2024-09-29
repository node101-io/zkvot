import child_process from 'child_process';
import os from 'os';
import path from 'path';

const availDockerFolderPath = path.join(os.homedir(), '.zkvot/avail');

const UNINSTALL_LIGHT_NODE_COMMAND = 'docker compose down --volumes --rmi all';

export default callback => {
  child_process.exec(
    UNINSTALL_LIGHT_NODE_COMMAND,
    { cwd: availDockerFolderPath },
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      console.log(stdout, stderr);

      return callback(null);
    }
  );
};