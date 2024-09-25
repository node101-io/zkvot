const Avail = require('../../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.createWallet((err, wallet) => {
    if (err)
      return res.json({ success: true, error: err });

    return res.json({
      success: true,
      data: {
        address: wallet.address,
        mnemonic: wallet.mnemonic
      }
    });
  });
};