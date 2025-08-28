import { Router } from "express";
import { initiateDeposit } from "../controllers/telebirr.js";
import { authenticate } from "../middlewares/authorize.js";
const router = Router();
router.post("/deposit", authenticate, initiateDeposit);
// crouter.post("/withdraw", authenticate, requestWithdrawal);
export default router;
