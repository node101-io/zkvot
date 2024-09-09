const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  if (!req.body || typeof req.body != 'object')
    return res.json({ err: 'bad_request' });

  if (!req.body.block_height || isNaN(req.body.block_height) || Number(req.body.block_height) < 0)
    return res.json({ err: 'bad_request' });

  if (!req.body.namespace || typeof req.body.namespace != 'string' || !req.body.namespace.length)
    return res.json({ err: 'bad_request' });

  Celestia.getData({
    block_height: req.body.block_height,
    namespace: req.body.namespace
  }, (err, blobsData) => {
    if (err)
      return res.json({ err: err });

    return res.json({ data: blobsData });
  });
};