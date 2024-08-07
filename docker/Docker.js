const os = require('os');

const installDocker = require('./functions/installDocker');
const isDockerActive = require('./functions/isDockerActive');
const isDockerInstalled = require('./functions/isDockerInstalled');

const platform = os.platform();

// Will be turned into a class
module.exports = {
  init: callback => {
    isDockerInstalled((err, installed) => {
      if (err)
        return callback(err);

      if (!installed) {
        installDocker(platform, (err, installed) => {
          if (err)
            return callback(err);

          return callback(null, 'docker_installed'); // finito
        });
      };

      isDockerActive((err, active) => {
        if (err)
          return callback(err);

        if (!active)
          return callback(null, 'docker_inactive');

        return callback(null, 'docker_active');
      });
    });
  }
};