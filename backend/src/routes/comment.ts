import { Router } from "express";
import {
  createComment,
  deleteComment,
  getCommentsByMarketId,
  getCommentsByUserId,
  getMyComments,
  toggleCommentLike,
  updateComment,
} from "../controllers/comment.js";
import { adminOnly, authenticate } from "../middlewares/authorize.js";

const router = Router();
// router.get("/comment/:userid", authenticate, adminOnly, getCommentsByUserId);

// router.post("/create", authenticate, createComment);
// router.get("/market/:marketId", authenticate, getCommentsByMarketId);
// router.get("/mycomment", authenticate, getMyComments);
// router.delete("/:id", authenticate, deleteComment);
// router.put("/:id", authenticate, updateComment);

router.get("/:marketId", authenticate, getCommentsByMarketId);
router.post("/:marketId", authenticate, createComment);
router.post("/:marketId/:commentId/like", authenticate, toggleCommentLike);

// Additional routes for admin functionality
router.get("/user/:id", authenticate, getCommentsByUserId);
router.delete("/:id", authenticate, deleteComment);
router.put("/:id", authenticate, updateComment);

export default router;
