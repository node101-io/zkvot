const Celestia = require('../../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.getWalletBalance((err, balance) => {
    if (err)
      return res.json({ err: err });

    return res.json({ data: balance });
  });
};