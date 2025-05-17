import { CommentRepository } from "@src/repositories/comment.repository";
import { IComment } from "@src/models/comment.model";
import mongoose, { QueryOptions } from "mongoose";
import { Status } from "@src/models/constants";

export class CommentService {
    constructor(private commentRepository: CommentRepository) {}

    /**
     * Create a new comment
     * @param commentData Comment data to create
     * @param options Optional database options (e.g., session)
     * @returns Created comment document
     */
    async createComment(
        commentData: Partial<IComment>,
        options?: QueryOptions
    ): Promise<IComment> {
        return this.commentRepository.create(commentData, options);
    }

    /**
     * Get comment by ID
     * @param id Comment ID
     * @param options Optional database options
     * @returns Comment document or null if not found
     */
    async getCommentById(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<IComment | null> {
        return this.commentRepository.findById(id, options);
    }

    /**
     * Get all comments for a specific post
     * @param postId Post ID
     * @param options Optional database options
     * @returns Array of comment documents
     */
    async getCommentsByPost(
        postId: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<IComment[]> {
        return this.commentRepository.findByPost(postId, options);
    }

    /**
     * Get all comments by a specific author
     * @param authorId Author ID
     * @param options Optional database options
     * @returns Array of comment documents
     */
    async getCommentsByAuthor(
        authorId: string,
        options?: QueryOptions
    ): Promise<IComment[]> {
        return this.commentRepository.findByAuthor(authorId, options);
    }

    /**
     * Get all replies to a specific comment
     * @param parentCommentId Parent comment ID
     * @param options Optional database options
     * @returns Array of reply comments
     */
    async getCommentReplies(
        parentCommentId: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<IComment[]> {
        return this.commentRepository.findReplies(parentCommentId, options);
    }

    /**
     * Update a comment
     * @param id Comment ID
     * @param updateData Data to update
     * @param options Optional database options
     * @returns Updated comment document or null if not found
     */
    async updateComment(
        id: mongoose.Types.ObjectId,
        updateData: Partial<IComment>,
        options?: QueryOptions
    ): Promise<IComment | null> {
        // Prevent changing certain fields
        const { postId, authorId, parentCommentId, ...safeUpdateData } =
            updateData;
        return this.commentRepository.update(id, safeUpdateData, options);
    }

    /**
     * Soft delete a comment (set status to DELETED)
     * @param id Comment ID
     * @param options Optional database options
     * @returns Updated comment document or null if not found
     */
    async deleteComment(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<IComment | null> {
        return this.commentRepository.delete(id, options);
    }

    /**
     * Permanently delete a comment
     * @param id Comment ID
     * @param options Optional database options
     * @returns Deleted comment document or null if not found
     */
    async hardDeleteComment(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<IComment | null> {
        return this.commentRepository.hardDelete(id, options);
    }

    /**
     * Recursively get all replies for a comment
     * @param parentCommentId Parent comment ID
     * @param options Optional database options
     * @returns Array of replies with nested replies
     */
    async getRepliesRecursive(
        parentCommentId: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<Partial<IComment>[]> {
        const directReplies = await this.getCommentReplies(
            parentCommentId,
            options
        );

        if (directReplies.length === 0) {
            return [];
        }

        return Promise.all(
            directReplies.map(async (reply) => {
                const nestedReplies = await this.getRepliesRecursive(
                    reply._id as mongoose.Types.ObjectId,
                    options
                );
                return { ...reply, replies: nestedReplies };
            })
        );
    }

    /**
     * Get all comments for a post with nested replies
     * @param postId Post ID
     * @param options Optional database options
     * @returns Array of top-level comments with nested replies
     */
    async getNestedCommentsByPost(
        postId: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<Partial<IComment>[]> {
        // Get all top-level comments (where parentCommentId is null)
        const topLevelComments = await this.commentRepository.findByPost(
            postId,
            {
                ...options,
                parentCommentId: null,
            }
        );

        // For each top-level comment, get its replies recursively
        return Promise.all(
            topLevelComments.map(async (comment) => {
                const replies = await this.getRepliesRecursive(
                    comment._id as mongoose.Types.ObjectId,
                    options
                );
                return { ...comment, replies };
            })
        );
    }
}
