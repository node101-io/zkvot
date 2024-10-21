import express from 'express';

const router = express.Router();

import electionFilterGetController from '../controllers/election/filter/get.js';
import electionCreatePostController from '../controllers/election/create/post.js';

router.get(
  '/filter',
    electionFilterGetController
);

router.post(
  '/create',
    electionCreatePostController
);

export default router;
