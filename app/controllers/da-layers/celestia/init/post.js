const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.init(req.body, err => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true });
  });
};