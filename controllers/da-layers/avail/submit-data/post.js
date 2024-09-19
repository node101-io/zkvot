const Avail = require('../../../../da-layers/avail/Avail');

module.exports = (req, res) => {
  Avail.submitData(
    req.body.data,
    (err, result) => {
      if (err)
        return res.json({ success: false, error: err });

      return res.json({
        success: true,
        data: result
      });
    }
  );
};