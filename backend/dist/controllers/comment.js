import { prisma } from "../utils/prisma.js";
let io;
export const setIoInstance = (socketIo) => {
    io = socketIo;
};
const createComment = async (req, res) => {
    const { text, marketId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!text || !marketId) {
        return res
            .status(400)
            .json({ message: "Content and marketId are required" });
    }
    try {
        const comment = await prisma.comment.create({
            data: {
                content: text,
                marketId: parseInt(marketId, 10),
                userId,
                likeCount: 0,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        const formattedComment = {
            id: comment.id.toString(),
            text: comment.content,
            user: comment.user.username || comment.user.email,
            liked: false, // New comments are not liked by anyone initially
            likeCount: comment.likeCount || 0,
            userProfileImage: comment.user.avatarUrl || null,
            createdAt: comment.createdAt.toISOString(),
            marketId: comment.marketId.toString(),
        };
        if (io) {
            console.log("Socket.IO instance available, emitting to room:", `market_${marketId}`);
            io.to(`market_${marketId}`).emit("new_comment", formattedComment);
            console.log(`Emitted new_comment for market ${marketId}`);
        }
        else {
            console.log("Socket.IO instance not available");
        }
        res.status(201).json(formattedComment);
    }
    catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getCommentsByMarketId = async (req, res) => {
    const { marketId } = req.params;
    const currentUserId = req.user?.id;
    if (!currentUserId) {
        res.status(404).json({ message: "there is no user" });
        return;
    }
    if (!marketId) {
        return res.status(400).json({ message: "marketId is required" });
    }
    try {
        const comments = await prisma.comment.findMany({
            where: { marketId: parseInt(marketId, 10) },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                likes: {
                    where: { userId: currentUserId || 0 },
                    select: { userId: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const formattedComments = comments.map((comment) => ({
            id: comment.id.toString(),
            text: comment.content,
            user: comment.user.username || comment.user.email,
            liked: comment.likes.length > 0,
            likeCount: comment.likeCount || 0,
            userProfileImage: comment.user.avatarUrl || null,
            createdAt: comment.createdAt.toISOString(),
            marketId: comment.marketId.toString(),
        }));
        res.status(200).json({ formattedComments });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getMyComments = async (req, res) => {
    const userId = req.user?.id;
    console.log("userid", userId);
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const comments = await prisma.comment.findMany({
            where: { id: userId },
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
        res.status(200).json({ comments });
    }
    catch (error) {
        console.error("Error fetching comments by user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getCommentsByUserId = async (req, res) => {
    const { userid } = req.params;
    if (!userid) {
        res.status(404).json({ message: "user not found or unauthorized" });
    }
    try {
        const comments = await prisma.comment.findMany({
            where: { id: Number(userid) },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        phone: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ message: "unable to fetch comments", error });
    }
};
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!commentId) {
        return res.status(400).json({ message: "commentId is required" });
    }
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId, 10) },
        });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.userId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        await prisma.comment.delete({
            where: { id: parseInt(commentId, 10) },
        });
        if (io) {
            io.to(`market_${comment.marketId}`).emit("comment_deleted", {
                id: parseInt(commentId, 10),
            });
        }
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!commentId || !content) {
        return res
            .status(400)
            .json({ message: "commentId and content are required" });
    }
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId, 10) },
        });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.userId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(commentId, 10) },
            data: { content },
        });
        if (io) {
            io.to(`market_${comment.marketId}`).emit("comment_updated", updatedComment);
        }
        res
            .status(200)
            .json({ message: "Comment updated successfully", updatedComment });
    }
    catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const toggleCommentLike = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!commentId) {
        return res.status(400).json({ message: "commentId is required" });
    }
    try {
        // Check if user already liked this comment
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                commentId_userId: {
                    commentId: parseInt(commentId, 10),
                    userId: userId
                }
            }
        });
        if (existingLike) {
            // User already liked, so unlike
            await prisma.commentLike.delete({
                where: {
                    commentId_userId: {
                        commentId: parseInt(commentId, 10),
                        userId: userId
                    }
                }
            });
            // Decrease like count
            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(commentId, 10) },
                data: {
                    likeCount: { decrement: 1 }
                },
            });
            console.log(`User ${userId} unliked comment ${commentId}, new like count: ${updatedComment.likeCount}`);
            if (io) {
                io.to(`market_${updatedComment.marketId}`).emit("comment_liked", updatedComment);
            }
            res.status(200).json({
                message: "Comment unliked successfully",
                comment: updatedComment,
                liked: false
            });
        }
        else {
            // User hasn't liked, so like
            await prisma.commentLike.create({
                data: {
                    commentId: parseInt(commentId, 10),
                    userId: userId
                }
            });
            // Increase like count
            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(commentId, 10) },
                data: {
                    likeCount: { increment: 1 }
                },
            });
            console.log(`User ${userId} liked comment ${commentId}, new like count: ${updatedComment.likeCount}`);
            if (io) {
                io.to(`market_${updatedComment.marketId}`).emit("comment_liked", updatedComment);
            }
            res.status(200).json({
                message: "Comment liked successfully",
                comment: updatedComment,
                liked: true
            });
        }
    }
    catch (error) {
        console.error("Error toggling comment like:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export { createComment, getCommentsByMarketId, deleteComment, updateComment, getCommentsByUserId, getMyComments, toggleCommentLike };
