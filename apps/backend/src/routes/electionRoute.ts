import express from 'express';

const router = express.Router();

import electionFilterGetController from '../controllers/election/filter/get.js';
import electionResultGetConroller from '../controllers/election/result/get.js';

import electionCreatePostController from '../controllers/election/create/post.js';

router.get(
  '/filter',
    electionFilterGetController
);
router.get(
  '/result',
    electionResultGetConroller
);

router.post(
  '/create',
    electionCreatePostController
);

export default router;
