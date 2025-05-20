import { Request, Response } from "express";
import { LikeService } from "@src/services/like.service";
import mongoose from "mongoose";

export class LikeController {
    constructor(private likeService: LikeService) {}

    /**
     * Create a new like
     * @route POST /likes
     * @param req Request object containing like data in body
     * @param res Response object
     * @returns Newly created like or error message
     */
    async createLike(req: Request, res: Response): Promise<void> {
        try {
            const likeData = req.body;
            const newLike = await this.likeService.createLike(likeData);
            res.status(201).json(newLike);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create like";
            res.status(500).json({
                message: "Failed to create like",
                error: errorMessage,
            });
        }
    }

    /**
     * Get like by ID
     * @route GET /likes/:id
     * @param req Request object containing like ID in params
     * @param res Response object
     * @returns Like document or not found message
     */
    async getLikeById(req: Request, res: Response): Promise<void> {
        try {
            const likeId = new mongoose.Types.ObjectId(req.params.id);
            const like = await this.likeService.getLikeById(likeId);

            if (!like) {
                res.status(404).json({ message: "Like not found" });
                return;
            }

            res.status(200).json(like);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to fetch like";
            res.status(500).json({
                message: "Failed to fetch like",
                error: errorMessage,
            });
        }
    }

    /**
     * Get all likes for a specific post
     * @route GET /posts/:postId/likes
     * @param req Request object containing post ID in params
     * @param res Response object
     * @returns Array of like documents
     */
    async getLikesByPost(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.postId);
            const likes = await this.likeService.getLikesByPost(postId);
            res.status(200).json(likes);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch likes";
            res.status(500).json({
                message: "Failed to fetch likes for post",
                error: errorMessage,
            });
        }
    }

    /**
     * Get all likes by a specific user
     * @route GET /users/:userId/likes
     * @param req Request object containing user ID in params
     * @param res Response object
     * @returns Array of like documents
     */
    async getLikesByUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const likes = await this.likeService.getLikesByUser(userId);
            res.status(200).json(likes);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch likes";
            res.status(500).json({
                message: "Failed to fetch user likes",
                error: errorMessage,
            });
        }
    }

    /**
     * Delete a like
     * @route DELETE /likes/:id
     * @param req Request object containing like ID in params
     * @param res Response object
     * @returns Success message or error
     */
    async deleteLike(req: Request, res: Response): Promise<void> {
        try {
            const likeId = new mongoose.Types.ObjectId(req.params.id);
            const deletedLike = await this.likeService.deleteLike(likeId);

            if (!deletedLike) {
                res.status(404).json({ message: "Like not found" });
                return;
            }

            res.status(200).json({ message: "Like removed successfully" });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to delete like";
            res.status(500).json({
                message: "Failed to delete like",
                error: errorMessage,
            });
        }
    }

    /**
     * Toggle a like for a post by a user
     * @route POST /posts/:postId/likes/toggle
     * @param req Request object containing post ID in params and user ID in body
     * @param res Response object
     * @returns The like document if created, or success message if removed
     */
    async toggleLike(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.postId);
            const { userId } = req.body;

            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }

            const result = await this.likeService.toggleLike(postId, userId);

            if (result) {
                res.status(201).json(result);
            } else {
                res.status(200).json({ message: "Like removed successfully" });
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to toggle like";
            res.status(500).json({
                message: "Failed to toggle like",
                error: errorMessage,
            });
        }
    }

    /**
     * Check if a post is liked by a user
     * @route GET /posts/:postId/likes/check
     * @param req Request object containing post ID in params and user ID in query
     * @param res Response object
     * @returns Boolean indicating if the post is liked
     */
    async isPostLikedByUser(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.postId);
            const { userId } = req.query;

            if (!userId || typeof userId !== "string") {
                res.status(400).json({ message: "User ID is required" });
                return;
            }

            const isLiked = await this.likeService.isPostLikedByUser(
                postId,
                userId
            );
            res.status(200).json({ isLiked });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to check like status";
            res.status(500).json({
                message: "Failed to check like status",
                error: errorMessage,
            });
        }
    }
}
