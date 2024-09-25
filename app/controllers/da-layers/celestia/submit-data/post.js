const Celestia = require('../../../../da-layers/celestia/Celestia');

module.exports = (req, res) => {
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