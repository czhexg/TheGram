import { QueryOptions } from "mongoose";
import { Comment, IComment } from "../models/comment.model";
import { BaseRepository } from "./base.repository";

export class CommentRepository extends BaseRepository<IComment> {
    constructor() {
        super(Comment);
    }

    async findByPost(
        postId: string,
        options?: QueryOptions
    ): Promise<IComment[]> {
        return this.model.find({ postId }, options).exec();
    }

    async findByAuthor(
        authorId: string,
        options?: QueryOptions
    ): Promise<IComment[]> {
        return this.model.find({ authorId }, options).exec();
    }

    async findReplies(
        parentCommentId: string,
        options?: QueryOptions
    ): Promise<IComment[]> {
        return this.model.find({ parentCommentId }, options).exec();
    }
}
