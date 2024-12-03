import express from 'express';

const router = express.Router();

import availGetController from '../controllers/block-info/avail/get.js';
import celestiaGetController from '../controllers/block-info/celestia/get.js';

import minaPostController from '../controllers/block-info/mina/post.js';

router.get(
  '/avail',
    availGetController
);
router.get(
  '/celestia',
    celestiaGetController
);

router.post(
  '/mina',
    minaPostController
);

export default router;
