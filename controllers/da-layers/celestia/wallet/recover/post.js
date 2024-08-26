const Celestia = require('../../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  if (!req.body || typeof req.body != 'object')
    return res.json({ err: 'bad_request' });

  if (!req.body.mnemonic || typeof req.body.mnemonic != 'string' || !req.body.mnemonic.length)
    return res.json({ err: 'bad_request' });

  Celestia.recoverWallet(req.body, (err, wallet) => {
    if (err)
      return res.json({ err: err });

    return res.json({ data: {
      address: wallet.address
    }});
  });
};