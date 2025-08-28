import { prisma } from "../../utils/prisma.js";
import { Decimal } from "@prisma/client/runtime/library";
const withdrawController = async (req, res) => {
    const { amount } = req.body;
    const userId = Number(req.user.id);
    if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
    }
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw { status: 404, message: "User not found" };
            const userBalance = new Decimal(user.balance);
            const withdrawAmount = new Decimal(amount);
            if (userBalance.lessThan(withdrawAmount)) {
                throw { status: 400, message: "Insufficient funds" };
            }
            const newBalance = userBalance.minus(withdrawAmount);
            await prisma.user.update({
                where: { id: userId },
                data: { balance: newBalance },
            });
            const transaction = await prisma.transaction.create({
                data: {
                    userId,
                    amount: withdrawAmount.negated(),
                    type: "withdraw",
                    status: "completed",
                },
            });
            return { balance: newBalance, transaction };
        });
        res.status(200).json({ message: "Withdrawal successful", balance: result.balance });
    }
    catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    }
};
const depositController = async (req, res) => {
    const { amount } = req.body;
    const userId = Number(req.user.id);
    if (!userId)
        return res.status(400).json({ message: "UserId required" });
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
    }
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw { status: 404, message: "User not found" };
            const userBalance = new Decimal(user.balance);
            const depositAmount = new Decimal(amount);
            const newBalance = userBalance.plus(depositAmount);
            await prisma.user.update({
                where: { id: userId },
                data: { balance: newBalance },
            });
            const transaction = await prisma.transaction.create({
                data: {
                    userId,
                    amount: depositAmount,
                    type: "deposit",
                    status: "completed",
                },
            });
            return { balance: newBalance, transaction };
        });
        res.status(200).json({ message: "Deposit successful", balance: result.balance });
    }
    catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    }
};
const getTransactionHistory = async (req, res) => {
    const userId = Number(req.params.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!userId)
        return res.status(400).json({ message: "UserId required" });
    try {
        const [transactions, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where: { userId } }),
        ]);
        res.status(200).json({
            transactions,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export { withdrawController, depositController, getTransactionHistory };
