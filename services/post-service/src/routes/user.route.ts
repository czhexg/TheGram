import express from "express";
import { Container } from "../container";

const router = express.Router();
const postController = Container.getPostController();
const likeController = Container.getLikeController();
const commentController = Container.getCommentController();

router.get(
    "/:authorId/posts",
    postController.getPostsByAuthor.bind(postController)
);

router.get(
    "/:userId/likes",
    likeController.getLikesByUser.bind(likeController)
);

router.get(
    "/:authorId/comments",
    commentController.getCommentsByAuthor.bind(commentController)
);

export default router;
