import { Router } from 'express';

import celestiaGenerateNameSpaceController from '../controllers/celestia/generate-namespace/get.js';
import celestiaBlockInfoController from '../controllers/celestia/block-info/get.js';
// import generateVoteProofController from '../controllers/zk-proof/generate-vote/post.js';
// import electionContractDeploymentController from '../controllers/zk-proof/election-contract-deployment/post.js';

const router = Router();

router.get('/celestia/generate-namespace',
  celestiaGenerateNameSpaceController
);
router.get('/celestia/block-info',
  celestiaBlockInfoController
);

// router.post('/zk-proof/generate-vote',
//   generateVoteProofController
// );
// router.post('/zk-proof/election-contract-deployment',
//   electionContractDeploymentController
// );

export default router;
