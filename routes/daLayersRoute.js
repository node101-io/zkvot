const express = require('express');

const router = express.Router();

const changeAppIdByProposalAvailDAPostController = require('../controllers/da-layers/avail/app-id/post');
const getDataAvailDAPostController = require('../controllers/da-layers/avail/get-data/post');
const initAvailDAPostController = require('../controllers/da-layers/avail/init/post');
const submitDataAvailDAPostController = require('../controllers/da-layers/avail/submit-data/post');
const uninstallAvailDAPostController = require('../controllers/da-layers/avail/uninstall/post');

const getWalletAddressAvailDAPostController = require('../controllers/da-layers/avail/wallet/address/post');
const getWalletBalanceAvailDAPostController = require('../controllers/da-layers/avail/wallet/balance/post');
const createWalletAvailDAPostController = require('../controllers/da-layers/avail/wallet/create/post');
const recoverWalletAvailDAPostController = require('../controllers/da-layers/avail/wallet/recover/post');

const getDataCelestiaDAPostController = require('../controllers/da-layers/celestia/get-data/post');
const initCelestiaDAPostController = require('../controllers/da-layers/celestia/init/post');
const submitDataCelestiaDAPostController = require('../controllers/da-layers/celestia/submit-data/post');
const uninstallCelestiaDAPostController = require('../controllers/da-layers/celestia/uninstall/post');

const getWalletAddressCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/address/post');
const getWalletBalanceCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/balance/post');
const createWalletCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/create/post');
const recoverWalletCelestiaDAPostController = require('../controllers/da-layers/celestia/wallet/recover/post');

router.post(
  '/avail/app-id',
  changeAppIdByProposalAvailDAPostController
);
router.post(
  '/avail/get-data',
  getDataAvailDAPostController
);
router.post(
  '/avail/init',
  initAvailDAPostController
);
router.post(
  '/avail/submit-data',
  submitDataAvailDAPostController
);
router.post(
  '/avail/uninstall',
  uninstallAvailDAPostController
);

router.post(
  '/avail/wallet/address',
  getWalletAddressAvailDAPostController
);
router.post(
  '/avail/wallet/balance',
  getWalletBalanceAvailDAPostController
);
router.post(
  '/avail/wallet/create',
  createWalletAvailDAPostController
);
router.post(
  '/avail/wallet/recover',
  recoverWalletAvailDAPostController
);

router.post(
  '/celestia/get-data',
  getDataCelestiaDAPostController
);
router.post(
  '/celestia/init',
  initCelestiaDAPostController
);
router.post(
  '/celestia/submit-data',
  submitDataCelestiaDAPostController
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