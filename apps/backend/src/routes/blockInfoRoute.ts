import express from 'express';

const router = express.Router();

import availGetController from '../controllers/block-info/avail/get.js';
import celestiaGetController from '../controllers/block-info/celestia/get.js';

router.get(
  '/avail',
    availGetController
);
router.get(
  '/celestia',
    celestiaGetController
);

export default router;
