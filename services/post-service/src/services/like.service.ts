import { LikeRepository } from "@src/repositories/like.repository";
import { ILike } from "@src/models/like.model";
import mongoose from "mongoose";
import { PostRepository } from "@src/repositories/post.repository";

export class LikeService {
    constructor(
        private likeRepository: LikeRepository,
        private postRepository: PostRepository
    ) {}

    /**
     * Create a new like
     * @param likeData Like data to create
     * @returns Created like document
     */
    async createLike(likeData: Partial<ILike>): Promise<ILike> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const createdLike = await this.likeRepository.create(likeData, {
                session,
            });
            await this.postRepository.incrementCounter(
                likeData.postId!,
                "likeCount",
                { session }
            );

            await session.commitTransaction();
            return createdLike;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get like by ID
     * @param id Like ID
     * @returns Like document or null if not found
     */
    async getLikeById(id: mongoose.Types.ObjectId): Promise<ILike | null> {
        return this.likeRepository.findById(id);
    }

    /**
     * Get all likes for a specific post
     * @param postId Post ID
     * @returns Array of like documents
     */
    async getLikesByPost(postId: mongoose.Types.ObjectId): Promise<ILike[]> {
        return this.likeRepository.findByPost(postId);
    }

    /**
     * Get all likes by a specific user
     * @param userId User ID
     * @returns Array of like documents
     */
    async getLikesByUser(userId: string): Promise<ILike[]> {
        return this.likeRepository.findByUser(userId);
    }

    /**
     * Check if a user has liked a specific post
     * @param postId Post ID
     * @param userId User ID
     * @returns Like document if exists, otherwise null
     */
    async getUserLikeForPost(
        postId: mongoose.Types.ObjectId,
        userId: string
    ): Promise<ILike | null> {
        return this.likeRepository.findByPostAndUser(postId, userId);
    }

    /**
     * Delete a like
     * @param id Like ID
     * @returns Deleted like document or null if not found
     */
    async deleteLike(id: mongoose.Types.ObjectId): Promise<ILike | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const foundLike = await this.likeRepository.findById(id);
            if (!foundLike) {
                throw new Error("Like not found");
            }
            const deletedLike = await this.likeRepository.hardDelete(id, {
                session,
            });
            await this.postRepository.decrementCounter(
                foundLike.postId!,
                "likeCount",
                { session }
            );
            await session.commitTransaction();
            return deletedLike;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Toggle a like for a post by a user
     * @param postId Post ID
     * @param userId User ID
     * @returns The like document if created, or null if removed
     */
    async toggleLike(
        postId: mongoose.Types.ObjectId,
        userId: string
    ): Promise<ILike | null> {
        // Check if like already exists
        const existingLike = await this.getUserLikeForPost(postId, userId);

        if (existingLike) {
            // Unlike if already liked
            await this.deleteLike(existingLike._id as mongoose.Types.ObjectId);
            return null;
        } else {
            // Create new like
            return this.createLike({ postId, userId });
        }
    }

    /**
     * Check if a post is liked by a user
     * @param postId Post ID
     * @param userId User ID
     * @returns Boolean indicating if the post is liked
     */
    async isPostLikedByUser(
        postId: mongoose.Types.ObjectId,
        userId: string
    ): Promise<boolean> {
        const like = await this.getUserLikeForPost(postId, userId);
        return !!like; // returns true if like exists
    }
}
