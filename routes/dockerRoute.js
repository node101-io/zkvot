const express = require('express');

const router = express.Router();

const activateDockerPostController = require('../controllers/docker/activate/post');
const getDockerInstallationUrlPostController = require('../controllers/docker/get-url/post');
const isDockerReadyPostController = require('../controllers/docker/is-ready/post');

router.post(
  '/activate',
  activateDockerPostController
);
router.post(
  '/get-url',
  getDockerInstallationUrlPostController
);
router.post(
  '/is-ready',
  isDockerReadyPostController
);

module.exports = router;