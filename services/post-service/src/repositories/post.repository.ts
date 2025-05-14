import { Post, IPost } from "../models/post.model";
import { BaseRepository } from "./base.repository";
import { Status } from "@src/models/constants";

export class PostRepository extends BaseRepository<IPost> {
    constructor() {
        super(Post);
    }

    async findByAuthor(authorId: string): Promise<IPost[]> {
        return this.model.find({ authorId }).exec();
    }

    async incrementCounter(
        id: string,
        field: "likeCount" | "commentCount"
    ): Promise<IPost | null> {
        return this.model
            .findByIdAndUpdate(id, { $inc: { [field]: 1 } }, { new: true })
            .exec();
    }

    async decrementCounter(
        id: string,
        field: "likeCount" | "commentCount"
    ): Promise<IPost | null> {
        return this.model
            .findByIdAndUpdate(id, { $inc: { [field]: -1 } }, { new: true })
            .exec();
    }

    async delete(id: string): Promise<IPost | null> {
        return this.model
            .findByIdAndUpdate(id, { status: Status.DELETED }, { new: true })
            .exec();
    }
}
