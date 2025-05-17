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

    async createPost(postData: Partial<IPost>): Promise<IPost> {
        return this.postRepository.create(postData);
    }

    async getPostById(id: mongoose.Types.ObjectId): Promise<IPost | null> {
        return this.postRepository.findById(id);
    }

    async getPostsByAuthor(authorId: string): Promise<IPost[]> {
        return this.postRepository.findByAuthor(authorId);
    }

    async updatePost(
        id: mongoose.Types.ObjectId,
        postData: Partial<IPost>
    ): Promise<IPost | null> {
        return this.postRepository.update(id, postData);
    }

    async deletePost(id: mongoose.Types.ObjectId): Promise<IPost | null> {
        return this.postRepository.delete(id);
    }

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
