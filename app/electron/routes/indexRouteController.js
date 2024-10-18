import { Router } from 'express';

import celestiaGenerateNameSpaceController from '../controllers/celestiaGenerateNameSpaceController.js';
import generateVoteProofController from '../controllers/generateVoteProofController.js';

const router = Router();

router.get('/celestia-generate-namespace', celestiaGenerateNameSpaceController);

router.post('/generate-vote-proof', generateVoteProofController);

export default router;
