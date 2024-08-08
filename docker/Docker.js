const os = require('os');

const activateDocker = require('./functions/activateDocker');
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
        installDocker(platform, err => {
          if (err)
            return callback(err);

          activateDocker(platform, err => {
            if (err)
              return callback(err);

            return callback(null);
          });
        });
      }

      isDockerActive((err, active) => {
        if (err)
          return callback(err);

        if (!active) {
          activateDocker(platform, err => {
            if (err)
              return callback(err);

            return callback(null);
          });
        };

        return callback(null);
      });
    });
  }
};