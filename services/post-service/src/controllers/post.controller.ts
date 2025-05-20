import { Request, Response } from "express";
import { PostService } from "@src/services/post.service";
import mongoose from "mongoose";

export class PostController {
    constructor(private postService: PostService) {}

    /**
     * Create a new post
     * @route POST /posts
     * @param req Request object containing post data in body
     * @param res Response object
     * @returns Newly created post or error message
     */
    async createPost(req: Request, res: Response): Promise<void> {
        try {
            const postData = req.body;
            const newPost = await this.postService.createPost(postData);
            res.status(201).json(newPost);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create post",
                error: (error as Error).message,
            });
        }
    }

    /**
     * Get a post by ID
     * @route GET /posts/:id
     * @param req Request object containing post ID in params
     * @param res Response object
     * @returns Post document or not found message
     */
    async getPostById(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.id);
            const post = await this.postService.getPostById(postId);

            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch post",
                error: (error as Error).message,
            });
        }
    }

    /**
     * Get all posts by author
     * @route GET /posts/author/:authorId
     * @param req Request object containing author ID in params
     * @param res Response object
     * @returns Array of posts by the author
     */
    async getPostsByAuthor(req: Request, res: Response): Promise<void> {
        try {
            const authorId = req.params.authorId;
            const posts = await this.postService.getPostsByAuthor(authorId);
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch posts",
                error: (error as Error).message,
            });
        }
    }

    /**
     * Update a post
     * @route PUT /posts/:id
     * @param req Request object containing post ID in params and update data in body
     * @param res Response object
     * @returns Updated post or error message
     */
    async updatePost(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.id);
            const updateData = req.body;

            const updatedPost = await this.postService.updatePost(
                postId,
                updateData
            );

            if (!updatedPost) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            res.status(200).json(updatedPost);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update post",
                error: (error as Error).message,
            });
        }
    }

    /**
     * Delete a post (soft delete)
     * @route DELETE /posts/:id
     * @param req Request object containing post ID in params
     * @param res Response object
     * @returns Success message or error
     */
    async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const postId = new mongoose.Types.ObjectId(req.params.id);
            const deletedPost = await this.postService.deletePost(postId);

            if (!deletedPost) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            res.status(200).json({ message: "Post deleted successfully" });
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete post",
                error: (error as Error).message,
            });
        }
    }
}
