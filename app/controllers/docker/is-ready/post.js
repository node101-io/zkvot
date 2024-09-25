const Docker = require('../../../docker/Docker');

module.exports = (req, res) => {
  Docker.isReady((err, isReady) => {
    if (err)
      return res.json({ err: err });

    return res.json({ data: isReady });
  });
};