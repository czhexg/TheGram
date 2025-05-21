import { Container } from "../container";
import express from "express";

const router = express.Router();
const commentController = Container.getCommentController();

// Set up routes
router.post("/", commentController.createComment.bind(commentController));
router.get("/:id", commentController.getCommentById.bind(commentController));
router.put("/:id", commentController.updateComment.bind(commentController));
router.delete("/:id", commentController.deleteComment.bind(commentController));
router.get(
    "/:commentId/replies",
    commentController.getCommentReplies.bind(commentController)
);

export default router;
