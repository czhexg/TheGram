import { PostRepository } from "../repositories/post.repository";
import { IPost } from "../models/post.model";
import { Status } from "@src/models/constants";
import mongoose, { ClientSession } from "mongoose";

export class PostService {
    constructor(private postRepository: PostRepository) {}
    // Note: This shorthand syntax:
    // 1. Declares a private class property
    // 2. Automatically assigns the parameter value to it
    // equivalant to:
    // private postRepository: PostRepository;
    // constructor(postRepository: PostRepository) {
    //     this.postRepository = postRepository;
    // }

    /**
     * Creates a new post
     * @param postData Partial post data to create
     * @returns Promise resolving to the created post document
     */
    async createPost(postData: Partial<IPost>): Promise<IPost> {
        return this.postRepository.create(postData);
    }

    /**
     * Retrieves a post by its ID
     * @param id MongoDB ObjectId of the post
     * @returns Promise resolving to the post document or null if not found
     */
    async getPostById(id: mongoose.Types.ObjectId): Promise<IPost | null> {
        return this.postRepository.findById(id);
    }

    /**
     * Retrieves all posts by a specific author
     * @param authorId ID of the author
     * @returns Promise resolving to an array of post documents
     */
    async getPostsByAuthor(authorId: string): Promise<IPost[]> {
        return this.postRepository.findByAuthor(authorId);
    }

    /**
     * Updates a post's data
     * @param id MongoDB ObjectId of the post to update
     * @param updateData Partial post data to update
     * @returns Promise resolving to the updated post document or null if not found
     * @note Prevents changing the authorId field
     */
    async updatePost(
        id: mongoose.Types.ObjectId,
        updateData: Partial<IPost>
    ): Promise<IPost | null> {
        // Prevent changing certain fields
        const { authorId, ...safeUpdateData } = updateData;
        return this.postRepository.update(id, safeUpdateData);
    }

    /**
     * Soft deletes a post (sets status to DELETED)
     * @param id MongoDB ObjectId of the post to delete
     * @returns Promise resolving to the deleted post document or null if not found
     */
    async deletePost(id: mongoose.Types.ObjectId): Promise<IPost | null> {
        return this.postRepository.delete(id);
    }

    /**
     * Updates a post's like counter
     * @param postId MongoDB ObjectId of the post to update
     * @param action Whether to increment or decrement the counter
     * @param session Optional MongoDB transaction session
     * @returns Promise resolving to the updated post document or null if not found
     */
    async updateLikeCounter(
        postId: mongoose.Types.ObjectId,
        action: "increment" | "decrement",
        session?: ClientSession
    ): Promise<IPost | null> {
        if (action === "increment") {
            return this.postRepository.incrementCounter(
                postId,
                "likeCount",
                session ? { session } : undefined
            );
        } else {
            return this.postRepository.decrementCounter(
                postId,
                "likeCount",
                session ? { session } : undefined
            );
        }
    }

    /**
     * Updates a post's comment counter
     * @param postId MongoDB ObjectId of the post to update
     * @param action Whether to increment or decrement the counter
     * @param session Optional MongoDB transaction session
     * @returns Promise resolving to the updated post document or null if not found
     */
    async updateCommentCounter(
        postId: mongoose.Types.ObjectId,
        action: "increment" | "decrement",
        session?: ClientSession
    ): Promise<IPost | null> {
        if (action === "increment") {
            return this.postRepository.incrementCounter(
                postId,
                "commentCount",
                session ? { session } : undefined
            );
        } else {
            return this.postRepository.decrementCounter(
                postId,
                "commentCount",
                session ? { session } : undefined
            );
        }
    }
}
