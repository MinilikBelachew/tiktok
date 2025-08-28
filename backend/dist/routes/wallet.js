import { Router } from "express";
import { withdrawController, depositController, getTransactionHistory } from "../controllers/admin/wallets.js";
import { authenticate } from "../middlewares/authorize.js";
const router = Router();
router.post("/deposit", authenticate, depositController);
router.post("/withdraw", authenticate, withdrawController);
router.get("/history/:userId", authenticate, getTransactionHistory);
export default router;
