import { Router } from "express";
import { authenticate } from "../middlewares/authorize.js";
import {
  checkPaymentStatus,
  getPaymentHistory,
  getWithdrawalHistory,
  handleWebhook,
  initiateDeposit,
  paymentSuccess,
  processWithdrawal,
  requestWithdrawal,
} from "../controllers/payment.js";

const router = Router();

// router.post("/webhook", handleWebhook);
router.get("/webhook", handleWebhook);
router.post("/deposit", authenticate, initiateDeposit);
router.get("/history", authenticate, getPaymentHistory);
router.post("/withdraw", authenticate, requestWithdrawal);
router.get("/status/:tx_ref", checkPaymentStatus);
router.post("/withdrawals/processes/:id", async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id, 10);

    const result = await processWithdrawal(withdrawalId);

    res.json(result);
  } catch (error) {
    console.error("Route withdrawal error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.get("/withdrawals", authenticate, getWithdrawalHistory);

router.get("/success", paymentSuccess);


export default router;
