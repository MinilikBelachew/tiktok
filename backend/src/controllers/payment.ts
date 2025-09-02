import axios from "axios";
import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { Chapa } from "chapa-nodejs";

const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY!,
});

const encryptData = (data: string): string => {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.CHAPA_ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

const decryptData = (encryptedData: string): string => {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.CHAPA_ENCRYPTION_KEY!, "hex");
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

const initiateDeposit = async (req: Request, res: Response) => {
  try {
    const { amount, phone, firstName, lastName, email } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const txRef = "TX-" + Date.now();

    const payment = await prisma.payment.create({
      data: {
        userId: Number(userId),
        amount: Number(amount),
        phone,
        txRef,
        type: "DEPOSIT",
        status: "PENDING",
      },
    });

    const returnUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-result?tx_ref=${txRef}`;
    const statusUrl = `/api/payments/status/${txRef}`; 

    const chapaRequest = {
      amount: amount,
      currency: "ETB",
      phone_number: phone,
      tx_ref: txRef,
      callback_url:
        process.env.CHAPA_CALLBACK_URL ||
        "https://tiktok-rstl.onrender.com/api/payments/webhook",
      return_url: returnUrl,
      first_name: firstName || "no user",
      last_name: lastName || "no user",
      email: email || "mama@gamil.com",
    };

    const chapaResponse = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      chapaRequest,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkout_url = chapaResponse.data.data.checkout_url;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl: checkout_url },
    });

    res.status(200).json({
      message: "Payment initiated successfully",
      checkoutUrl: checkout_url,
      txRef,
      statusUrl, // <-- frontend calls this after redirect
    });
  } catch (error: any) {
    console.error("Deposit initiation error:", error);
    return res.status(500).json({
      message: "Failed to initiate deposit",
      error: error.message,
    });
  }
};


const handleWebhook = async (req: Request, res: Response) => {
  const CHAPA_SECRET_HEADER = process.env.CHAPA_WEBHOOK_SECRET; // Set a secret in env
  let responseMessage = "Webhook processed";

  try {


    const tx_ref=req.body.tx_ref || req.query.trx_ref || req.body.tx_ref
    const status=req.body.status || req.query.status

    // const { tx_ref, status } = req.body;

    // Basic validation
    if (!tx_ref || !status) {
      return res
        .status(400)
        .json({ message: "Invalid request: missing tx_ref or status" });
    }

    // Verify webhook secret header (optional but recommended)
    const webhookSecret = req.headers["x-chapa-signature"];
    if (CHAPA_SECRET_HEADER && webhookSecret !== CHAPA_SECRET_HEADER) {
      return res.status(403).json({ message: "Unauthorized webhook request" });
    }

    console.log("Webhook received:", req.body);

    const lowerStatus = status.toLowerCase();

    if (["success", "completed", "successful"].includes(lowerStatus)) {
      try {
        // Verify transaction with Chapa API
        const verificationResponse = await axios.get(
          `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const chapaStatus = verificationResponse.data.status.toLowerCase();
        console.log("Chapa verification response:", verificationResponse.data);

        if (chapaStatus === "success") {
          const payment = await prisma.payment.findUnique({
            where: { txRef: tx_ref },
            include: { user: true },
          });

          if (payment && payment.status !== "COMPLETED") {
            await prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { txRef: tx_ref },
                data: { status: "COMPLETED", verifiedAt: new Date() },
              });

              if (payment.type === "DEPOSIT") {
                await tx.user.update({
                  where: { id: payment.userId },
                  data: {
                    balance: { increment: new Prisma.Decimal(payment.amount) },
                  },
                });

                await tx.transaction.create({
                  data: {
                    userId: payment.userId,
                    type: "DEPOSIT",
                    amount: payment.amount,
                    status: "COMPLETED",
                    description: `Deposit via Chapa - ${tx_ref}`,
                    currency: payment.currency,
                    transactionStatus: "COMPLETED",
                    referenceId: tx_ref,
                  },
                });

                await tx.userActivity.create({
                  data: {
                    userId: payment.userId,
                    action: "DEPOSIT_COMPLETED",
                    details: {
                      amount: payment.amount,
                      currency: payment.currency,
                      txRef: tx_ref,
                      method: "Chapa",
                    },
                  },
                });
              }
            });

            responseMessage = `Payment completed successfully for ${tx_ref}`;
          } else {
            responseMessage = `Payment already processed or not found: ${tx_ref}`;
          }
        } else {
          responseMessage = `Chapa verification pending or failed for ${tx_ref}`;
        }
      } catch (verifyError) {
        console.error("Verification error:", verifyError);
        responseMessage = "Error verifying transaction";
      }
    } else if (lowerStatus === "pending") {
      console.log(`Payment is pending for ${tx_ref}`);
      responseMessage = `Payment is pending for ${tx_ref}`;
      // Optional: update DB to mark as pending
      await prisma.payment.update({
        where: { txRef: tx_ref },
        data: { status: "PENDING" },
      });
    } else if (lowerStatus === "failed") {
      console.log(`Payment failed for ${tx_ref}`);
      responseMessage = `Payment failed for ${tx_ref}`;
      // Optional: update DB to mark as failed
      await prisma.payment.update({
        where: { txRef: tx_ref },
        data: { status: "FAILED" },
      });
    } else {
      console.log(`Unknown status received: ${status}`);
      responseMessage = `Webhook received with unknown status: ${status}`;
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    responseMessage = "Error processing webhook";
  }

  return res.status(200).json({ message: responseMessage });
};

const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { tx_ref } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { txRef: tx_ref },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      txRef: payment.txRef,
      status: payment.status,
      amount: payment.amount,
      verifiedAt: payment.verifiedAt,
    });
  } catch (error: any) {
    console.error("Payment status check error:", error);
    res.status(500).json({
      message: "Failed to check payment status",
      error: error.message,
    });
  }
};



const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    return res.status(200).json({
      data: payments,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    return res.status(500).json({ message: error.message });
  }
};

const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const {
      amount,
      type = "MOBILE_MONEY", // Default to mobile money
      accountName,
      accountNumber,
      bankName,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate required fields
    if (!amount || !accountName || !accountNumber) {
      return res.status(400).json({
        message: "Amount, account name, and account number are required",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (amount > Number(user.balance)) {
      return res.status(400).json({
        message: "Insufficient balance",
        currentBalance: user.balance,
        requestedAmount: amount,
      });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        type,
        accountName,
        accountNumber,
        currency: "ETB",
        status: "PENDING",
        bankName: bankName || null,
        // Remove these fields - they'll be set during processing
        // processedAt,
        // routingNumber,
        // reference,
      },
    });

    // Automatically process the withdrawal
    try {
      const processResult = await processWithdrawal(withdrawal.id);
      
      if (processResult.success) {
        return res.status(200).json({
          message: "Withdrawal processed successfully",
          withdrawal: {
            id: withdrawal.id,
            amount: withdrawal.amount,
            type: withdrawal.type,
            accountName: withdrawal.accountName,
            bankName: withdrawal.bankName,
            accountNumber: withdrawal.accountNumber,
            currency: withdrawal.currency,
            status: "COMPLETED",
            createdAt: withdrawal.createdAt,
          },
        });
      } else {
        return res.status(400).json({
          message: "Withdrawal request submitted but processing failed",
          withdrawal: {
            id: withdrawal.id,
            amount: withdrawal.amount,
            type: withdrawal.type,
            accountName: withdrawal.accountName,
            bankName: withdrawal.bankName,
            accountNumber: withdrawal.accountNumber,
            currency: withdrawal.currency,
            status: "FAILED",
            createdAt: withdrawal.createdAt,
          },
          error: processResult.message,
        });
      }
    } catch (processError: any) {
      console.error("Auto-processing withdrawal error:", processError);
      return res.status(201).json({
        message: "Withdrawal request submitted but processing failed",
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          type: withdrawal.type,
          accountName: withdrawal.accountName,
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
          currency: withdrawal.currency,
          status: "FAILED",
          createdAt: withdrawal.createdAt,
        },
        error: processError.message,
      });
    }
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      message: "Failed to submit withdrawal request",
      error: error.message,
    });
  }
};
// const requestWithdrawal = async (req: Request, res: Response) => {
//   try {
//     const {
//       amount,
//       type,
//       bankName,
//       accountName,
//       accountNumber,
//       processedAt,
//       routingNumber,
//     } = req.body;
//     const userId = req.user?.id;

//     if (!userId)
//       return res.status(401).json({ message: "User not authenticated" });

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { balance: true },
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (amount <= 0 || amount > Number(user.balance)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or insufficient balance" });
//     }

//     // Create withdrawal request with temporary reference
//     const withdrawal = await prisma.withdrawal.create({
//       data: {
//         userId,
//         amount,
//         type,
//         bankName,
//         accountName,
//         accountNumber,
//         currency: "ETB",
//         processedAt,
//         routingNumber,

//         status: "PENDING",
//         reference: "WD-" + Date.now(), // temporary internal reference
//       },
//     });

//     return res.status(201).json({
//       message: "Withdrawal request submitted successfully",
//       withdrawal,
//     });
//   } catch (error: any) {
//     console.error("Withdrawal request error:", error);
//     return res.status(500).json({
//       message: "Failed to submit withdrawal request",
//       error: error.message,
//     });
//   }
// };

const generateTxRef = () => `WD-${Date.now()}`;
const processWithdrawal = async (withdrawalId: number) => {
  try {
    // Fetch withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        accountNumber: true,
        accountName: true,
        status: true,
      },
    });

    if (!withdrawal) throw new Error("Withdrawal not found");
    if (withdrawal.status !== "PENDING") throw new Error("Already processed");

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: withdrawal.userId },
      select: { id: true, balance: true },
    });
    if (!user) throw new Error("User not found");

    const tx_ref = generateTxRef();
    console.log("Generated tx_ref:", tx_ref);

    // Prepare Mobile Money transfer data
    const transferData = {
      account_name: withdrawal.accountName,
      account_number: withdrawal.accountNumber,
      amount: withdrawal.amount.toString(),
      currency: withdrawal.currency || "ETB",
      reference: "3241342142sfdd",
      bank_code: 656,
    };

    console.log("Sending withdrawal request to Chapa:", transferData);

    // ✅ EXPLICIT TOKEN HANDLING
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaSecretKey) {
      throw new Error("CHAPA_SECRET_KEY not configured");
    }

    console.log("=== TOKEN DEBUG ===");
    console.log("Token value:", chapaSecretKey);
    console.log("Token type:", typeof chapaSecretKey);
    console.log("Token length:", chapaSecretKey.length);
    console.log("===================");

    // ✅ CREATE HEADERS SEPARATELY
    const headers = {
      Authorization: `Bearer ${chapaSecretKey}`,
      "Content-Type": "application/json",
    };

    console.log("Headers being sent:", headers);

    // Call Chapa transfer API
    const response = await axios.post(
      "https://api.chapa.co/v1/transfers",
      transferData,
      { headers }
    );

    console.log("Chapa transfer response:", response.data);

    if (response.data.status?.toLowerCase() === "success") {
      // Update database transactionally
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { decrement: withdrawal.amount } },
        }),
        prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "COMPLETED",
            processedAt: new Date(),
            reference: tx_ref,
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "WITHDRAWAL",
            amount: withdrawal.amount,
            status: "COMPLETED",
            currency: withdrawal.currency,
            transactionStatus: "COMPLETED",
            referenceId: tx_ref,
            description: `Withdrawal via Chapa - ${tx_ref}`,
          },
        }),
        prisma.userActivity.create({
          data: {
            userId: user.id,
            action: "WITHDRAWAL_COMPLETED",
            details: {
              amount: withdrawal.amount,
              currency: withdrawal.currency,
              referenceId: tx_ref,
              method: "Chapa",
            },
          },
        }),
      ]);

      return { success: true, message: "Withdrawal processed successfully" };
    } else {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "FAILED" },
      });
      return { success: false, message: "Chapa withdrawal failed" };
    }
  } catch (error: any) {
    console.error("Withdrawal error:", error.response?.data || error.message);

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "FAILED" },
    });

    throw error;
  }
};

const getWithdrawalHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.withdrawal.count({ where: { userId } }),
    ]);

    return res.status(200).json({
      data: withdrawals,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching withdrawal history:", error);
    return res.status(500).json({ message: error.message });
  }
};

const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { tx_ref } = req.query; // Get tx_ref from query params

    if (!tx_ref) {
      return res.status(400).json({ message: "Transaction reference missing" });
    }

    // Check payment status
    const payment = await prisma.payment.findUnique({
      where: { txRef: tx_ref as string },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      message: "Payment successful!",
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        txRef: payment.txRef,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Payment success error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export {
  getWithdrawalHistory,
  requestWithdrawal,
  getPaymentHistory,
  handleWebhook,
  initiateDeposit,
  checkPaymentStatus,
  paymentSuccess,
  processWithdrawal,
};
