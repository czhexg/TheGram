import { Request, Response } from "express";
import { CommentService } from "@src/services/comment.service";
import mongoose from "mongoose";

export class CommentController {
    constructor(private commentService: CommentService) {}

    /**
     * Create a new comment
     * @route POST /comments
     * @param req Request object containing comment data in body
     * @param res Response object
     * @returns Newly created comment or error message
     */
    async createComment(req: Request, res: Response): Promise<void> {
        try {
            const commentData = req.body;
            const newComment = await this.commentService.createComment(
                commentData
            );
            res.status(201).json(newComment);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create comment";
            res.status(500).json({
                message: "Failed to create comment",
                error: errorMessage,
            });
        }
    }

    /**
     * Get comment by ID
     * @route GET /comments/:id
     * @param req Request object containing comment ID in params
     * @param res Response object
     * @returns Comment document or not found message
     */
    async getCommentById(req: Request, res: Response): Promise<void> {
        try {
            const commentId = new mongoose.Types.ObjectId(req.params.id);
            const comment = await this.commentService.getCommentById(commentId);

            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }

            res.status(200).json(comment);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch comment";
            res.status(500).json({
                message: "Failed to fetch comment",
                error: errorMessage,
            });
        }
    }

    /**
     * Get all comments for a specific post
     * @route GET /posts/:postId/comments
     * @param req Request object containing post ID in params
     * @param res Response object
     * @returns Array of comment documents
     */
    async getCommentsByPost(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.postId);
            const comments = await this.commentService.getCommentsByPost(
                postId
            );
            res.status(200).json(comments);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch comments";
            res.status(500).json({
                message: "Failed to fetch comments for post",
                error: errorMessage,
            });
        }
    }

    /**
     * Get all comments by a specific author
     * @route GET /users/:authorId/comments
     * @param req Request object containing author ID in params
     * @param res Response object
     * @returns Array of comment documents
     */
    async getCommentsByAuthor(req: Request, res: Response): Promise<void> {
        try {
            const authorId = req.params.authorId;
            const comments = await this.commentService.getCommentsByAuthor(
                authorId
            );
            res.status(200).json(comments);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch comments";
            res.status(500).json({
                message: "Failed to fetch user comments",
                error: errorMessage,
            });
        }
    }

    /**
     * Get all replies to a specific comment
     * @route GET /comments/:commentId/replies
     * @param req Request object containing comment ID in params
     * @param res Response object
     * @returns Array of reply comments
     */
    async getCommentReplies(req: Request, res: Response): Promise<void> {
        try {
            const parentCommentId = new mongoose.Types.ObjectId(
                req.params.commentId
            );
            const replies = await this.commentService.getCommentReplies(
                parentCommentId
            );
            res.status(200).json(replies);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch replies";
            res.status(500).json({
                message: "Failed to fetch comment replies",
                error: errorMessage,
            });
        }
    }

    /**
     * Update a comment
     * @route PUT /comments/:id
     * @param req Request object containing comment ID in params and update data in body
     * @param res Response object
     * @returns Updated comment or error message
     */
    async updateComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = new mongoose.Types.ObjectId(req.params.id);
            const updateData = req.body;

            const updatedComment = await this.commentService.updateComment(
                commentId,
                updateData
            );

            if (!updatedComment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }

            res.status(200).json(updatedComment);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to update comment";
            res.status(500).json({
                message: "Failed to update comment",
                error: errorMessage,
            });
        }
    }

    /**
     * Soft delete a comment
     * @route DELETE /comments/:id
     * @param req Request object containing comment ID in params
     * @param res Response object
     * @returns Success message or error
     */
    async deleteComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = new mongoose.Types.ObjectId(req.params.id);
            const deletedComment = await this.commentService.deleteComment(
                commentId
            );

            if (!deletedComment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }

            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to delete comment";
            res.status(500).json({
                message: "Failed to delete comment",
                error: errorMessage,
            });
        }
    }

    /**
     * Get all comments for a post with nested replies
     * @route GET /posts/:postId/comments/nested
     * @param req Request object containing post ID in params
     * @param res Response object
     * @returns Array of top-level comments with nested replies
     */
    async getNestedCommentsByPost(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.postId);
            const comments = await this.commentService.getNestedCommentsByPost(
                postId
            );
            res.status(200).json(comments);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch nested comments";
            res.status(500).json({
                message: "Failed to fetch nested comments",
                error: errorMessage,
            });
        }
    }
}
