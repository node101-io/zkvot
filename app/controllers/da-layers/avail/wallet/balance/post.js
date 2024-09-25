const Avail = require('../../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.getWalletBalance((err, balance) => {
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