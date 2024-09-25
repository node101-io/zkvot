const Avail = require('../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.getData({
    block_height: req.body.block_height
  }, (err, data) => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true, data });
  });
};