import express from 'express';

const router = express.Router();

import electionCreatePostController from '../controllers/election/create/post.js';
import electionFilterPostController from '../controllers/election/filter/post.js';
import electionResultPostConroller from '../controllers/election/result/post.js';

router.post(
  '/create',
    electionCreatePostController
);
router.post(
  '/filter',
    electionFilterPostController
);
router.post(
  '/result',
    electionResultPostConroller
);

export default router;
