import express from "express";
import { Container } from "../container";

const router = express.Router();
const postController = Container.getPostController();
const likeController = Container.getLikeController();
const commentController = Container.getCommentController();

// posts
router.post("/", postController.createPost.bind(postController));
router.get("/:id", postController.getPostById.bind(postController));
router.put("/:id", postController.updatePost.bind(postController));
router.delete("/:id", postController.deletePost.bind(postController));

// likes
router.get(
    "/:postId/likes",
    likeController.getLikesByPost.bind(likeController)
);
router.post(
    "/:postId/likes/toggle",
    likeController.toggleLike.bind(likeController)
);
router.get(
    "/:postId/likes/check",
    likeController.isPostLikedByUser.bind(likeController)
);

// comments
router.get(
    "/:postId/comments",
    commentController.getCommentsByPost.bind(commentController)
);
router.get(
    "/:postId/comments/nested",
    commentController.getNestedCommentsByPost.bind(commentController)
);

export default router;
