import mongoose, { Date } from "mongoose";
import { Status } from "./constants";

interface IPost extends mongoose.Document {
    authorId: string;
    content: string;
    hashtags: string[];
    images: string[];
    status: Status;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new mongoose.Schema<IPost>(
    {
        authorId: { type: String, required: true },
        content: { type: String, required: true },
        hashtags: { type: [String], default: [] },
        images: { type: [String], default: [] },
        status: { type: String, default: Status.ACTIVE },
        likeCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Post = mongoose.model<IPost>("Post", PostSchema);

export { Post, IPost };
