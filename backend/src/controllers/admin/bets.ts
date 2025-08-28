import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../utils/prisma.js";
import { Request, Response } from "express";
import { MarketStatus } from "@prisma/client";

const createBet = async (req: Request, res: Response) => {
  const { marketId, amount, outcome } = req.body;
  const userId = req.user?.id;

  try {
    // Validate inputs
    if (!userId || isNaN(parseInt(marketId, 10)) || !amount || !outcome) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Fetch user and market concurrently
    const [user, market] = await Promise.all([
      prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { balance: true },
      }),
      prisma.market.findUnique({
        where: { id: parseInt(marketId, 10) },
      }),
    ]);

    // Validate market
    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }

    if (market.status !== MarketStatus.OPEN) {
      return res.status(400).json({ message: "Market is not open for betting" });
    }

    if (!market.participants.includes(outcome)) {
      return res.status(400).json({ message: "Invalid outcome" });
    }

    // Validate user and balance
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      return res.status(400).json({ message: "Invalid bet amount" });
    }

   if (user.balance.toNumber() < betAmount) {
  return res.status(400).json({ message: "Insufficient balance" });
}
    // Create bet and update balance in a transaction
    const result = await prisma.$transaction([
      // Create the bet
      prisma.bet.create({
        data: {
          marketId: parseInt(marketId, 10),
          userId: Number(userId),
          amount: betAmount,
          outcome,
        },
      }),
      // Update user balance
      prisma.user.update({
        where: { id: Number(userId) },
        data: {
          balance: {
            decrement: betAmount,
          },
        },
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: Number(userId),
          type: "BET_PLACED",
          amount: betAmount,
          status: "completed",
          description: `Bet placed on market ${marketId} for outcome ${outcome}`,
          currency: "USD",
          transactionStatus: "completed",
          referenceId: `BET_${marketId}_${userId}_${Date.now()}`,
        },
      }),
    ]);

    res.status(201).json({ message: "Bet created successfully", bet: result[0] });
  } catch (error) {
    console.error("Error creating bet:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const getBetsByUserId = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const bets = await prisma.bet.findMany({
      where: { userId },
      include: {
        market: true,
      },
    });

    if (bets.length === 0) {
      return res.status(404).json({ message: "No bets found for this user" });
    }

    res.status(200).json(bets);
  } catch (error) {
    console.error("Error fetching bets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBetById = async (req: Request, res: Response) => {
  const betId = parseInt(req.params.id, 10);

  try {
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        market: true,
        user: true,
      },
    });

    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    res.status(200).json(bet);
  } catch (error) {
    console.error("Error fetching bet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBetsMyMarketId = async (req: Request, res: Response) => {
  const marketId = parseInt(req.params.marketId, 10);
  try {
    const bets = await prisma.bet.findMany({
      where: { marketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (bets.length === 0) {
      return res.status(404).json({ message: "No bets found for this market" });
    }

    res.status(200).json({ bets });
  } catch (error) {
    console.error("Error fetching bets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBets = async (req: Request, res: Response) => { 
  try {
    const bets = await prisma.bet.findMany({
      include: {
        market: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(bets);
  } catch (error) {
    console.error("Error fetching all bets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateBet = async (req: Request, res: Response) => {
  const betId = parseInt(req.params.id, 10);
  const { amount } = req.body;

  try {
    const existingBet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    if (!existingBet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    const market = await prisma.market.findUnique({
      where: { id: existingBet.marketId },
    });

    if (market?.status !== MarketStatus.OPEN) {
      return res
        .status(400)
        .json({ message: "Market is not open for updates" });
    }

    const bet = await prisma.bet.update({
      where: { id: betId },
      data: { amount },
    });

    res.status(200).json({ message: "Bet updated successfully", bet });
  } catch (error) {
    console.error("Error updating bet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalBet = async (req: Request, res: Response) => {
  const marketId = parseInt(req.params.marketId, 10);
  
  try {
    const bets = await prisma.bet.findMany({
      where: { marketId },
    });

    if (bets.length === 0) {
      return res.status(404).json({ message: "No bets found for this market" });
    }

    const totalBetAmount = bets
      .reduce((total, bet) => total.plus(bet.amount), new Decimal(0))
      .toNumber();

    res.status(200).json({ totalBetAmount });
  } catch (error) {
    console.error("Error fetching total bet amount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


const getTotalUser = async(req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const bets = await prisma.bet.findMany({
      where: { userId },
    });

    if (bets.length === 0) {
      return res.status(404).json({ message: "No bets found for this user" });
    }

    const totalBetAmount = bets
      .reduce((total, bet) => total.plus(bet.amount), new Decimal(0))
      .toNumber();

    res.status(200).json({ totalBetAmount });
  } catch (error) {
    console.error("Error fetching total bet amount for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteBet = async (req: Request, res: Response) => {
  const betId = parseInt(req.params.id, 10);

  try {
    const existingBet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    if (!existingBet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    const market = await prisma.market.findUnique({
      where: { id: existingBet.marketId },
    });

    if (market?.status !== MarketStatus.OPEN) {
      return res
        .status(400)
        .json({ message: "Market is not open for deletions" });
    }

    await prisma.bet.delete({
      where: { id: betId },
    });

    res.status(200).json({ message: "Bet deleted successfully" });
  } catch (error) {
    console.error("Error deleting bet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resolveMarket = async (req: Request, res: Response) => {
  const marketId = parseInt(req.params.marketId, 10);
  const { winningOutcome } = req.body;

  try {
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: { bets: true },
    });

    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }

    if (market.status !== MarketStatus.OPEN) {
      return res.status(400).json({ message: "Market cannot be resolved" });
    }

    if (!market.participants.includes(winningOutcome)) {
      return res.status(400).json({ message: "Invalid winning outcome" });
    }

    await prisma.market.update({
      where: { id: marketId },
      data: { status: MarketStatus.SETTLED, resolvedOutcome: winningOutcome },
    });

    const totalAmount = market.bets.reduce(
      (sum, bet) => sum.plus(bet.amount),
      new Decimal(0)
    );

    const winningBetsAmount = market.bets
      .filter((bet) => bet.outcome === winningOutcome)
      .reduce((sum, bet) => sum.plus(bet.amount), new Decimal(0));

    if (winningBetsAmount.gt(0)) {
      for (const bet of market.bets) {
        const betStatus = bet.outcome === winningOutcome ? "won" : "lost";
        if (bet.outcome === winningOutcome) {
          const payout = bet.amount
            .div(winningBetsAmount)
            .times(totalAmount)
            .toDecimalPlaces(2);

          // Update user balance
          await prisma.user.update({
            where: { id: bet.userId },
            data: {
              balance: {
                increment: payout,
              },
            },
          });

          // Update bet with payout and status
          await prisma.bet.update({
            where: { id: bet.id },
            data: { payout, status: betStatus },
          });

          console.log(`Updated user ${bet.userId} balance by ${payout} for bet ${bet.id}`);
        } else {
          // Update losing bets' status
          await prisma.bet.update({
            where: { id: bet.id },
            data: { status: betStatus },
          });
        }
      }
    }

    res.status(200).json({
      message: "Market resolved, payouts calculated, and balances updated successfully",
    });
  } catch (error) {
    console.error("Error resolving market:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createBet,
  getBetsByUserId,
  getBetById,
  updateBet,
  deleteBet,
  resolveMarket,
  getBetsMyMarketId,
  getAllBets,
  getTotalBet,
  getTotalUser
};
