const Docker = require('../../../docker/Docker');

module.exports = (req, res) => {
  Docker.activate(err => {
    if (err)
      return res.json({ err: err });

    return res.json({});
  });
};