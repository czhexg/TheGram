import express from "express";
import { Container } from "../container";

const router = express.Router();
const likeController = Container.getLikeController();

// Set up routes
router.post("/", likeController.createLike.bind(likeController));
router.get("/:id", likeController.getLikeById.bind(likeController));
router.delete("/:id", likeController.deleteLike.bind(likeController));

export default router;
