const Celestia = require('../../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.recoverWallet(req.body, (err, wallet) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({
      success: true,
      data: {
        address: wallet.address
      }
    });
  });
};