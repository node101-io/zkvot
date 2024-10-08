import isDockerActive from './functions/isDockerActive.js';
import isDockerInstalled from './functions/isDockerInstalled.js';

const Docker = {
  isActive: callback => {
    isDockerActive((err, isActive) => {
      if (err)
        return callback(err);

      if (!isActive) {
        return callback(null, false);
      } else {
        return callback(null, true);
      };
    });
  },
  isInstalled: callback => {
    isDockerInstalled((err, isInstalled) => {
      if (err)
        return callback(err);

      if (!isInstalled) {
        return callback(null, false);
      } else {
        return callback(null, true);
      };
    });
  }
};

export default Docker;