const Avail = require('../../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.recoverWallet(req.body, (err, wallet) => {
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