import express from "express";
import postRoutes from "./post.route";
import likeRoutes from "./like.route";
import commentRoutes from "./comment.route";
import userRoutes from "./user.route";

const router = express.Router();

const v1Router = express.Router();
v1Router.use("/posts", postRoutes);
v1Router.use("/likes", likeRoutes);
v1Router.use("/comments", commentRoutes);
v1Router.use("/users", userRoutes);

router.use("/v1", v1Router);

export default router;
