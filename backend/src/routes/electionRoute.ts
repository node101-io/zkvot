import express from 'express';

const router = express.Router();

import electionFilterGetController from '../controllers/election/filter/get';

import electionCreatePostController from '../controllers/election/create/post';

router.get(
  '/filter',
    electionFilterGetController
);

router.post(
  '/create',
    electionCreatePostController
);

module.exports = router;
