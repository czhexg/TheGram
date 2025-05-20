import { CommentRepository } from "@src/repositories/comment.repository";
import { IComment } from "@src/models/comment.model";
import mongoose from "mongoose";
import { PostRepository } from "@src/repositories/post.repository";

export class CommentService {
    constructor(
        private commentRepository: CommentRepository,
        private postRepository: PostRepository
    ) {}

    /**
     * Create a new comment
     * @param commentData Comment data to create
     * @returns Created comment document
     */
    async createComment(commentData: Partial<IComment>): Promise<IComment> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const createdComment = await this.commentRepository.create(
                commentData,
                { session }
            );
            await this.postRepository.incrementCounter(
                commentData.postId!,
                "commentCount",
                { session }
            );
            await session.commitTransaction();
            return createdComment;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get comment by ID
     * @param id Comment ID
     * @returns Comment document or null if not found
     */
    async getCommentById(
        id: mongoose.Types.ObjectId
    ): Promise<IComment | null> {
        return this.commentRepository.findById(id);
    }

    /**
     * Get all comments for a specific post
     * @param postId Post ID
     * @returns Array of comment documents
     */
    async getCommentsByPost(
        postId: mongoose.Types.ObjectId
    ): Promise<IComment[]> {
        return this.commentRepository.findByPost(postId);
    }

    /**
     * Get all comments by a specific author
     * @param authorId Author ID
     * @returns Array of comment documents
     */
    async getCommentsByAuthor(authorId: string): Promise<IComment[]> {
        return this.commentRepository.findByAuthor(authorId);
    }

    /**
     * Get all replies to a specific comment
     * @param parentCommentId Parent comment ID
     * @returns Array of reply comments
     */
    async getCommentReplies(
        parentCommentId: mongoose.Types.ObjectId
    ): Promise<IComment[]> {
        return this.commentRepository.findReplies(parentCommentId);
    }

    /**
     * Update a comment
     * @param id Comment ID
     * @param updateData Data to update
     * @returns Updated comment document or null if not found
     */
    async updateComment(
        id: mongoose.Types.ObjectId,
        updateData: Partial<IComment>
    ): Promise<IComment | null> {
        // Prevent changing certain fields
        const { postId, authorId, parentCommentId, ...safeUpdateData } =
            updateData;
        return this.commentRepository.update(id, safeUpdateData);
    }

    /**
     * Soft delete a comment (set status to DELETED)
     * @param id Comment ID
     * @returns Updated comment document or null if not found
     */
    async deleteComment(id: mongoose.Types.ObjectId): Promise<IComment | null> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const foundComment = await this.commentRepository.findById(id);
            if (!foundComment) {
                throw new Error("Comment not found");
            }

            const deletedComment = await this.commentRepository.delete(id, {
                session,
            });
            await this.postRepository.decrementCounter(
                foundComment.postId!,
                "commentCount",
                { session }
            );
            await session.commitTransaction();
            return deletedComment;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Permanently delete a comment
     * @param id Comment ID
     * @returns Deleted comment document or null if not found
     */
    async hardDeleteComment(
        id: mongoose.Types.ObjectId
    ): Promise<IComment | null> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const foundComment = await this.commentRepository.findById(id);
            if (!foundComment) {
                throw new Error("Comment not found");
            }

            const deletedComment = await this.commentRepository.hardDelete(id, {
                session,
            });
            await this.postRepository.decrementCounter(
                foundComment.postId!,
                "commentCount",
                { session }
            );
            await session.commitTransaction();
            return deletedComment;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Recursively get all replies for a comment
     * @param parentCommentId Parent comment ID
     * @returns Array of replies with nested replies
     */
    async getRepliesRecursive(
        parentCommentId: mongoose.Types.ObjectId
    ): Promise<Partial<IComment>[]> {
        const directReplies = await this.getCommentReplies(parentCommentId);

        if (directReplies.length === 0) {
            return [];
        }

        return Promise.all(
            directReplies.map(async (reply) => {
                const nestedReplies = await this.getRepliesRecursive(
                    reply._id as mongoose.Types.ObjectId
                );
                return { ...reply, replies: nestedReplies };
            })
        );
    }

    /**
     * Get all comments for a post with nested replies
     * @param postId Post ID
     * @returns Array of top-level comments with nested replies
     */
    async getNestedCommentsByPost(
        postId: mongoose.Types.ObjectId
    ): Promise<Partial<IComment>[]> {
        // Get all top-level comments (where parentCommentId is null)
        const topLevelComments = await this.commentRepository.findByPost(
            postId,
            {
                parentCommentId: null,
            }
        );

        // For each top-level comment, get its replies recursively
        return Promise.all(
            topLevelComments.map(async (comment) => {
                const replies = await this.getRepliesRecursive(
                    comment._id as mongoose.Types.ObjectId
                );
                return { ...comment, replies };
            })
        );
    }
}
