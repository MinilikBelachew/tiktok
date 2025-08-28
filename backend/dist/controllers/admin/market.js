import { MarketStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma.js";
const createMarket = async (req, res) => {
    const { title, contestant1, contestant2, images, startDate, endDate, calendar } = req.body;
    if (!title || !contestant1 || !contestant2) {
        return res.status(400).json({ message: "Title and two contestants are required" });
    }
    try {
        // Check if the market already exists
        const existingMarket = await prisma.market.findFirst({
            where: {
                title,
                participants: {
                    hasSome: [contestant1, contestant2],
                },
            },
        });
        if (existingMarket) {
            return res.status(400).json({ message: "Market with this title and contestants already exists" });
        }
        const datas = {
            title,
            participants: [contestant1, contestant2],
            participantImages: images || null,
            status: MarketStatus.OPEN,
            startTime: startDate ? new Date(startDate) : null,
            endTime: endDate ? new Date(endDate) : null,
            calendar: calendar ? new Date(calendar) : null,
        };
        if (req.cloudinaryResult) {
            datas.participantImages = req.cloudinaryResult.url;
        }
        const market = await prisma.market.create({
            data: datas,
            select: {
                id: true,
                title: true,
                participants: true,
                participantImages: true,
                status: true,
                startTime: true,
                endTime: true,
                calendar: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.status(201).json({ message: "Market created successfully", market });
    }
    catch (error) {
        console.error("Error creating market:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getMarkets = async (req, res) => {
    try {
        const markets = await prisma.market.findMany({
            orderBy: { startTime: "asc" },
        });
        res.status(200).json(markets);
    }
    catch (error) {
        console.error("Error fetching markets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getSettledMarkets = async (req, res) => {
    try {
        const markets = await prisma.market.findMany({
            where: { status: "SETTLED" },
            orderBy: { endTime: "desc" },
        });
        res.status(200).json(markets);
    }
    catch (error) {
        console.error("Error fetching settled markets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getOpenMarkets = async (req, res) => {
    try {
        const markets = await prisma.market.findMany({
            where: { status: "OPEN" },
            orderBy: { startTime: "asc" },
        });
        res.status(200).json(markets);
    }
    catch (error) {
        console.error("Error fetching open markets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getUpcomingMarkets = async (req, res) => {
    try {
        const markets = await prisma.market.findMany({
            where: { status: "UPCOMING" },
            orderBy: { startTime: "asc" },
        });
        res.status(200).json(markets);
    }
    catch (error) {
        console.error("Error fetching upcoming markets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getMarketById = async (req, res) => {
    const { id } = req.params;
    try {
        const market = await prisma.market.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!market) {
            return res.status(404).json({ message: "Market not found" });
        }
        res.status(200).json(market);
    }
    catch (error) {
        console.error("Error fetching market:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const updateMarket = async (req, res) => {
    const { id } = req.params;
    const { title, participants, startTime, endTime, status } = req.body;
    try {
        // Check if market exists
        const existingMarket = await prisma.market.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!existingMarket) {
            return res.status(404).json({ message: "Market not found" });
        }
        // Validate status if provided
        if (status && !['OPEN', 'CLOSED', 'SETTLED', 'CANCELLED', 'UPCOMING'].includes(status)) {
            return res.status(400).json({ message: "Invalid market status" });
        }
        // Prepare update data
        const updateData = {};
        if (title)
            updateData.title = title;
        if (participants && Array.isArray(participants))
            updateData.participants = participants;
        if (startTime)
            updateData.startTime = new Date(startTime);
        if (endTime)
            updateData.endTime = new Date(endTime);
        if (status)
            updateData.status = status;
        // Handle image upload if provided
        if (req.cloudinaryResult) {
            updateData.participantImages = req.cloudinaryResult.url;
        }
        const market = await prisma.market.update({
            where: { id: parseInt(id, 10) },
            data: updateData,
        });
        res.status(200).json({ message: "Market updated successfully", market });
    }
    catch (error) {
        console.error("Error updating market:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const deleteMarket = async (req, res) => {
    const { id } = req.params;
    try {
        const market = await prisma.market.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(200).json({ message: "Market deleted successfully", market });
    }
    catch (error) {
        console.error("Error deleting market:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const activateMarket = async (req, res) => {
    const { id } = req.params;
    try {
        const existingMarket = await prisma.market.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!existingMarket) {
            return res.status(404).json({ message: "Market not found" });
        }
        const market = await prisma.market.update({
            where: { id: parseInt(id, 10) },
            data: { status: "OPEN" },
        });
        res.status(200).json({ message: "Market activated successfully", market });
    }
    catch (error) {
        console.error("Error activating market:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const deactivateMarket = async (req, res) => {
    const { id } = req.params;
    try {
        const existingMarket = await prisma.market.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!existingMarket) {
            return res.status(404).json({ message: "Market not found" });
        }
        const market = await prisma.market.update({
            where: { id: parseInt(id, 10) },
            data: { status: "CLOSED" },
        });
        res.status(200).json({ message: "Market deactivated successfully", market });
    }
    catch (error) {
        console.error("Error deactivating market:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export { createMarket, getMarkets, getMarketById, updateMarket, deleteMarket, activateMarket, deactivateMarket, getSettledMarkets, getOpenMarkets, getUpcomingMarkets, };
