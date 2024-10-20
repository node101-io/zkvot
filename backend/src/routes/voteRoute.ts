import express from 'express';

const router = express.Router();

import voteSendPostController from '../controllers/vote/send/post';

router.post(
  '/send',
    voteSendPostController
);

module.exports = router;