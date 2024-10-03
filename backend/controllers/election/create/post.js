const Election = require('../../../models/election/Election'); 

module.exports = (req, res) => {
  Election.createElection(req.body, (error, election) => {
    if (error) {
      if (error === 'bad_request') return res.status(400).json({"status": "error", "message": "Bad request"});
      if (error === 'database_error') return res.status(500).json({"status": "error", "message": "Bad request"});
      if (error === 'duplicated_unique_field') return res.status(409).json({"status": "error", "message": "Bad request"});
    }
    
    return res.status(201).json({"status": "success", "data": election});
  });
}