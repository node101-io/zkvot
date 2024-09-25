const Celestia = require('../../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.getWalletBalance((err, balance) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({
      success: true,
      data: {
        balance
      }
    });
  });
};