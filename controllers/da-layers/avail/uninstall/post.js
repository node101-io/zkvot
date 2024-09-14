const Avail = require('../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.uninstall(err => {
    if (err)
      return res.json({ success: false, error: err });

    return res.json({ success: true });
  });
};