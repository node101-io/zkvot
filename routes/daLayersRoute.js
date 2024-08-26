const express = require('express');

const router = express.Router();

const initCelestiaDAPostController = require('../controllers/da-layers/celestia/init/post');
const uninstallCelestiaDAPostController = require('../controllers/da-layers/celestia/uninstall/post');

const getWalletAddressCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/address/post');
const getWalletBalanceCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/balance/post');
const createWalletCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/address/post');
const recoverWalletCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/recover/post');

router.post(
  '/celestia/init',
  initCelestiaDAPostController
);
router.post(
  '/celestia/uninstall',
  uninstallCelestiaDAPostController
);

router.post(
  '/celestia/wallet/address',
  getWalletAddressCelestiaDAPostController
);
router.post(
  '/celestia/wallet/balance',
  getWalletBalanceCelestiaDAPostController
);
router.post(
  '/celestia/wallet/create',
  createWalletCelestiaDAPostController
);
router.post(
  '/celestia/wallet/recover',
  recoverWalletCelestiaDAPostController
);

module.exports = router;