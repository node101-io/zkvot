const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.init((err, res) => {
    if (err)
      return res.json({ err: err });

    return res.json({});
  });
};