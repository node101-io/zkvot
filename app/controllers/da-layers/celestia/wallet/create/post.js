const Celestia = require('../../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.createWallet((err, wallet) => {
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