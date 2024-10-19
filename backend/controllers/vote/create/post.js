const Vote = require('../../../models/vote/Vote'); 

module.exports = (req, res) => {
  Vote.createVote(req.body, (error, vote) => {
    if (error) {
      if (error === 'bad_request') return res.status(400).json({status: "error", message: "Bad request"});
      if (error === 'duplicated_unique_field') return res.status(409).json({status: "error", message: "duplicated_unique_field"});
    
      return res.status(500).json({status: "error", message: "Internal server error"});
    }
    
    return res.status(201).json({ status: success, data: vote });
  });
}