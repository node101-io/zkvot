const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.uninstall((err, res) => {
    if (err)
      return res.json({ err: err });

    return res.json({});
  });
};