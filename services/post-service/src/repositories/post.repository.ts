import mongoose, { QueryOptions } from "mongoose";
import { Post, IPost } from "../models/post.model";
import { BaseRepository } from "./base.repository";

export class PostRepository extends BaseRepository<IPost> {
    constructor() {
        super(Post);
    }

    async findByAuthor(
        authorId: string,
        options?: QueryOptions
    ): Promise<IPost[]> {
        return this.model.find({ authorId }, options).exec();
    }

    async incrementCounter(
        id: mongoose.Types.ObjectId,
        field: "likeCount" | "commentCount",
        options?: QueryOptions
    ): Promise<IPost | null> {
        return this.model
            .findByIdAndUpdate(
                id,
                { $inc: { [field]: 1 } },
                { new: true, ...options }
            )
            .exec();
    }

    async decrementCounter(
        id: mongoose.Types.ObjectId,
        field: "likeCount" | "commentCount",
        options?: QueryOptions
    ): Promise<IPost | null> {
        return this.model
            .findByIdAndUpdate(
                id,
                { $inc: { [field]: -1 } },
                { new: true, ...options }
            )
            .exec();
    }
}
