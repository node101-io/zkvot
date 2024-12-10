import express from 'express';

const router = express.Router();

import provePostController from '../controllers/post.js';

router.post(
  '/',
    provePostController
);

export default router;
