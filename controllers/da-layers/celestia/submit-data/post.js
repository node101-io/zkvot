const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  if (!req.body || typeof req.body != 'object')
    return res.json({ err: 'bad_request' });

  if (!req.body.namespace || typeof req.body.namespace != 'string' || !req.body.namespace.length)
    return res.json({ err: 'bad_request' });

  if (!req.body.data || typeof req.body.data != 'object')
    return res.json({ err: 'bad_request' });

  Celestia.submitData(
    req.body.namespace,
    req.body.data,
    (err, blockHeight) => {
      if (err)
        return res.json({ success: false, error: err });

      return res.json({
        success: true,
        data : {
          block_height: blockHeight
        }
      });
    }
  );
};