import express from 'express';

const router = express.Router();

import voteSendPostController from '../controllers/vote/send/post.js';

router.post(
  '/send',
    voteSendPostController
);

export default router;
