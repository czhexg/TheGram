import mongoose, { Date } from "mongoose";

enum PostStatus {
    PUBLISHED = "PUBLISHED",
    DELETED = "DELETED",
}

interface IPost extends mongoose.Document {
    authorId: string;
    content: string;
    hashtags: string[];
    images: string[];
    status: PostStatus;
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
        status: { type: String, default: PostStatus.PUBLISHED },
        likeCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
