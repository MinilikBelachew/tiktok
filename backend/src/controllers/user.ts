import { Request, Response } from "express";
import { prisma } from "./../utils/prisma.js";

const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        bio: true,
        isSuspended: true,
        Market: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            bets: {
              select: {
                id: true,
                amount: true,
                createdAt: true,
              },
            },
          },
        },
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { email, phone, username, bio } = req.body;

  try {
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return res
          .status(400)
          .json({ message: "Email is already in use by another account" });
      }
    }
    if (phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          message: "Phone number is already in use by another account",
        });
      }
    }

    const updateData: any = { email, phone, username, bio };
    if (req.cloudinaryResult) {
      updateData.avatarUrl = req.cloudinaryResult.url;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        bio: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const myBalance = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const balance = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
      },
    });
    res.status(200).json({ message: "Your balance is :", balance });
  } catch (error) {}
};

const deleteMyAccount = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalUser = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({});
    res.status(200).json({ message: "Total users", totalUsers });
  } catch (error) {
    res.status(500).json({ message: "error fetching users", error });
  }
};
export {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  myBalance,
  getTotalUser,
};
