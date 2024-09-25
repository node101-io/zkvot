const Docker = require('../../../docker/Docker');

module.exports = (req, res) => {
  Docker.getInstallationUrl((err, installationUrl) => {
    if (err)
      return res.json({ err: err });

    return res.json({ data: installationUrl });
  });
};