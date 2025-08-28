import { Request, Response } from "express";
import { prisma } from "./../../utils/prisma.js";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = (req.query.search as string)?.trim() || "";

    const searchFilter = searchQuery ? {
      OR: [
        { email: { contains: searchQuery, mode: "insensitive" as const } },
        { phone: { contains: searchQuery, mode: "insensitive" as const } },
      ]
    } : {};

    const totalUsers = await prisma.user.count({
      where: searchFilter,
    });

    
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      where: searchFilter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res
      .status(200)
      .json({
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        users,
      });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const suspendUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { isSuspended } = req.body;
  console.log("Incoming body:", req.body);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User ${
        user.isSuspended ? "suspended" : "activated"
      } successfully`,
      user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { email, phone } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { email, phone },
    });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const suspendUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { isSuspended } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended },
      select: {
        id: true,
        email: true,
        phone: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: `User ${isSuspended ? "suspended" : "activated"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserActivity = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        action: true,
        details: true,
        deviceType: true,
        ipAddress: true,
        userAgent: true,
        location: true,
        timestamp: true,
        createdAt: true,
      },
    });

    if (activities.length === 0) {
      return res.status(404).json({ message: "No activities found for this user" });
    }

    res.status(200).json({ activities });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export {
  getAllUsers,
  suspendUser,
  updateUser,
  deleteUser,
  getUserById,
  suspendUserById,
  getUserActivity
};
