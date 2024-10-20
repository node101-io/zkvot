import { Router } from "express";

import celestiaGenerateNameSpaceController from "../controllers/celestiaGenerateNameSpaceController.js";
import generateVoteProofController from "../controllers/generateVoteProofController.js";
import celestiaBlockInfoController from "../controllers/celestiaBlockInfoController.js";

const router = Router();

router.get("/celestia-generate-namespace", celestiaGenerateNameSpaceController);
router.post("/generate-vote-proof", generateVoteProofController);

router.get("/celestia-block-info", celestiaBlockInfoController);

export default router;
