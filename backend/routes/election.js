const express = require('express');

const router = express.Router();

const electionPostController = require('../controllers/election/create/post');

router.post(
  '/create',
  electionPostController
);

module.exports = router;
