const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
  Celestia.getData({
    block_height: req.body.block_height,
    namespace: req.body.namespace
  }, (err, blobsData) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, data: blobsData });
  });
};