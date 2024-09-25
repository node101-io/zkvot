const Avail = require('../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.changeAppIdByProposal(
    req.body,
    err => {
      if (err)
        return res.json({ success: false, error: err });

      return res.json({ success: true });
    });
};