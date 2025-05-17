import mongoose, { QueryOptions } from "mongoose";
import { Like, ILike } from "../models/like.model";
import { BaseRepository } from "./base.repository";

export class LikeRepository extends BaseRepository<ILike> {
    constructor() {
        super(Like);
    }

    async findByPost(
        postId: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<ILike[]> {
        return this.model.find({ postId }, options).exec();
    }

    async findByUser(userId: string, options?: QueryOptions): Promise<ILike[]> {
        return this.model.find({ userId }, options).exec();
    }

    async findByPostAndUser(
        postId: mongoose.Types.ObjectId,
        userId: string,
        options?: QueryOptions
    ): Promise<ILike | null> {
        return this.model.findOne({ postId, userId }, options).exec();
    }
}
