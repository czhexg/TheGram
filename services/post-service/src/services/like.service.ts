import { LikeRepository } from "@src/repositories/like.repository";
import { ILike } from "@src/models/like.model";
import mongoose, { ClientSession, QueryOptions } from "mongoose";
import { Status } from "@src/models/constants";

export class LikeService {
    constructor(private likeRepository: LikeRepository) {}

    /**
     * Create a new like
     * @param likeData Like data to create
     * @param options Optional database options (e.g., session)
     * @returns Created like document
     */
    async createLike(
        likeData: Partial<ILike>,
        options?: QueryOptions
    ): Promise<ILike> {
        return this.likeRepository.create(likeData, options);
    }

    /**
     * Get like by ID
     * @param id Like ID
     * @param options Optional database options
     * @returns Like document or null if not found
     */
    async getLikeById(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<ILike | null> {
        return this.likeRepository.findById(id, options);
    }

    /**
     * Get all likes for a specific post
     * @param postId Post ID
     * @param options Optional database options
     * @returns Array of like documents
     */
    async getLikesByPost(
        postId: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<ILike[]> {
        return this.likeRepository.findByPost(postId, options);
    }

    /**
     * Get all likes by a specific user
     * @param userId User ID
     * @param options Optional database options
     * @returns Array of like documents
     */
    async getLikesByUser(
        userId: string,
        options?: QueryOptions
    ): Promise<ILike[]> {
        return this.likeRepository.findByUser(userId, options);
    }

    /**
     * Check if a user has liked a specific post
     * @param postId Post ID
     * @param userId User ID
     * @param options Optional database options
     * @returns Like document if exists, otherwise null
     */
    async getUserLikeForPost(
        postId: mongoose.Types.ObjectId,
        userId: string,
        options?: QueryOptions
    ): Promise<ILike | null> {
        return this.likeRepository.findByPostAndUser(postId, userId, options);
    }

    /**
     * Delete a like
     * @param id Like ID
     * @param options Optional database options
     * @returns Deleted like document or null if not found
     */
    async deleteLike(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<ILike | null> {
        return this.likeRepository.hardDelete(id, options);
    }

    /**
     * Toggle a like for a post by a user
     * @param postId Post ID
     * @param userId User ID
     * @param session Optional transaction session
     * @returns The like document if created, or null if removed
     */
    async toggleLike(
        postId: mongoose.Types.ObjectId,
        userId: string,
        session?: ClientSession
    ): Promise<ILike | null> {
        const options = session ? { session } : undefined;

        // Check if like already exists
        const existingLike = await this.getUserLikeForPost(
            postId,
            userId,
            options
        );

        if (existingLike) {
            // Unlike if already liked
            await this.deleteLike(
                existingLike._id as mongoose.Types.ObjectId,
                options
            );
            return null;
        } else {
            // Create new like
            return this.createLike({ postId, userId }, options);
        }
    }

    /**
     * Check if a post is liked by a user
     * @param postId Post ID
     * @param userId User ID
     * @param options Optional database options
     * @returns Boolean indicating if the post is liked
     */
    async isPostLikedByUser(
        postId: mongoose.Types.ObjectId,
        userId: string,
        options?: QueryOptions
    ): Promise<boolean> {
        const like = await this.getUserLikeForPost(postId, userId, options);
        return !!like; // returns true if like exists
    }
}
